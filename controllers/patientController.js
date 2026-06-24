
const Patient = require("../models/Patient");
const Settings = require("../models/Settings");



// CALCULATE ESTIMATED TIMES
const calculateEstimatedTimes = async () => {

  const waitingPatients = await Patient.find({
    status: "waiting",
  }).sort({
    isEmergency: -1,
    createdAt: 1,
  });

  let cumulativeTime = 0;

  // CURRENT SERVING PATIENT
  const servingPatient = await Patient.findOne({
    status: "serving",
  });

  if (servingPatient) {

    cumulativeTime =
      Number(servingPatient.remainingTime || 0);

  }

  for (let i = 0; i < waitingPatients.length; i++) {

    cumulativeTime += Number(
      waitingPatients[i].consultationTime || 0
    );

    waitingPatients[i].estimatedTime =
      cumulativeTime;

    await waitingPatients[i].save();

  }

};



// ADD PATIENT
exports.addPatient = async (req, res) => {

  try {

    const {
      name,
      age,
      phone,
      consultationTime,
      isEmergency,
    } = req.body;

    const totalPatients =
      await Patient.countDocuments();

    let token;

    if (isEmergency) {

      token = `E-${totalPatients + 1}`;

    } else {

      token = `${totalPatients + 1}`;

    }

    const patient = await Patient.create({

      tokenNumber: token,
      name,
      age,
      phone,
      consultationTime,
      remainingTime: consultationTime,
      isEmergency,

    });

    await calculateEstimatedTimes();

    const patients = await Patient.find().sort({
      createdAt: 1,
    });

    req.io.emit(
      "queueUpdated",
      patients
    );

    res.status(201).json({

      success: true,
      patient,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};



// GET ALL PATIENTS
exports.getPatients = async (req, res) => {

  try {

    const patients =
      await Patient.find().sort({
        createdAt: 1,
      });

    res.status(200).json({

      success: true,
      patients,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};



// CLEAR COMPLETED
exports.clearCompletedPatients = async (
  req,
  res
) => {

  try {

    await Patient.deleteMany({
      status: "done",
    });

    const updatedPatients =
      await Patient.find();

    req.io.emit(
      "queueUpdated",
      updatedPatients
    );

    res.status(200).json({

      success: true,
      message:
        "Completed patients cleared",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};



// CALL NEXT PATIENT
exports.callNextPatient = async (
  req,
  res
) => {

  try {

    let settings =
      await Settings.findOne();

    if (!settings) {

      settings =
        await Settings.create({

          currentToken: "--",
          totalServedToday: 0,

        });

    }

    // CURRENT SERVING -> DONE
    const currentServing =
      await Patient.findOne({
        status: "serving",
      });

    if (currentServing) {

      currentServing.status = "done";

      currentServing.remainingTime = 0;

      await currentServing.save();

    }

    // NEXT WAITING PATIENT
    const nextPatient =
      await Patient.findOne({
        status: "waiting",
      }).sort({

        isEmergency: -1,
        createdAt: 1,

      });

    // NO PATIENTS
    if (!nextPatient) {

      settings.currentToken =
        "Queue Empty";

      await settings.save();

      req.io.emit(
        "queueUpdated",
        []
      );

      return res.status(200).json({

        success: true,
        message: "Queue Empty",

      });

    }

    // START SERVING
    nextPatient.status = "serving";

    nextPatient.startedAt =
      new Date();

    nextPatient.remainingTime =
      nextPatient.consultationTime;

    await nextPatient.save();

    // SETTINGS UPDATE
    settings.currentToken =
      nextPatient.tokenNumber;

    settings.totalServedToday =
      (settings.totalServedToday || 0) + 1;

    await settings.save();

    // RECALCULATE TIMES
    await calculateEstimatedTimes();

    // UPDATED LIST
    const updatedPatients =
      await Patient.find().sort({
        createdAt: 1,
      });

    // SOCKET UPDATE
    req.io.emit(
      "queueUpdated",
      updatedPatients
    );

    res.status(200).json({

      success: true,
      currentPatient: nextPatient,

    });

  } catch (error) {

    console.log(
      "CALL NEXT ERROR:"
    );

    console.log(error);

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};

