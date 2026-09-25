const questions = {
    English: [
        "What is the main problem or symptom you are experiencing?",
        "When did this problem start?",
        "How severe is the problem?",
        "Have you noticed any other symptoms?",
        "Have you had any medical conditions or illnesses before?",
        "Do you have any allergies?",
        "Are you currently taking any medicines?",
        "Have you had any previous surgeries or hospitalizations?",
        "Is there any important family medical history you would like to mention?",
        "Is there anything else about your health that you would like the doctor to know?"
    ],

    Hindi: [
        "आपको अभी मुख्य समस्या या कौन सा लक्षण हो रहा है?",
        "यह समस्या कब शुरू हुई?",
        "यह समस्या कितनी गंभीर है?",
        "क्या आपको कोई और लक्षण दिखाई दे रहे हैं?",
        "क्या आपको पहले कोई बीमारी या स्वास्थ्य संबंधी समस्या रही है?",
        "क्या आपको किसी चीज़ से एलर्जी है?",
        "क्या आप अभी कोई दवा ले रहे हैं?",
        "क्या आपकी पहले कोई सर्जरी हुई है या आपको अस्पताल में भर्ती होना पड़ा है?",
        "क्या आपके परिवार में किसी को कोई महत्वपूर्ण बीमारी रही है?",
        "क्या आप अपने स्वास्थ्य के बारे में डॉक्टर को और कुछ बताना चाहते हैं?"
    ],

    Marathi: [
        "तुम्हाला सध्या मुख्य समस्या किंवा कोणती लक्षणे जाणवत आहेत?",
        "ही समस्या कधीपासून सुरू झाली?",
        "ही समस्या किती गंभीर आहे?",
        "तुम्हाला आणखी काही लक्षणे जाणवत आहेत का?",
        "तुम्हाला यापूर्वी कोणता आजार किंवा आरोग्याशी संबंधित समस्या झाली आहे का?",
        "तुम्हाला कोणत्याही गोष्टीची ऍलर्जी आहे का?",
        "तुम्ही सध्या कोणती औषधे घेत आहात?",
        "तुमची यापूर्वी कोणती शस्त्रक्रिया झाली आहे किंवा रुग्णालयात दाखल व्हावे लागले आहे का?",
        "तुमच्या कुटुंबात कोणाला काही महत्त्वाचा आजार आहे का?",
        "तुमच्या आरोग्याबद्दल डॉक्टरांना आणखी काही सांगायचे आहे का?"
    ]
};


// ======================================================
// GET NEXT QUESTION
// ======================================================

const generateNextQuestion = async ({
    language = "English",
    answers = []
}) => {

    const selectedQuestions =
        questions[language] || questions.English;

    const questionIndex = answers.length;

    if (questionIndex >= selectedQuestions.length) {
        return "INTERVIEW_COMPLETE";
    }

    return selectedQuestions[questionIndex];
};


module.exports = {
    generateNextQuestion
};