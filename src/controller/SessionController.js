const EditorSessionService = require('../services/EditorSessionService');
const UserService = require('../services/UserService');
const SessionService = require('../services/SessionService');

exports.session_get = async (req, res) => {
  try {
    const listOfSessions = await SessionService.getListOfSessions();
    res.send(listOfSessions);
  } catch (err) {
    throw err;
  }
};

exports.session_post = async (req, res) => {
  try {
    const userId = UserService.getUserId(req.user);
    const { sessionName, sessionType } = req.body;
    const session = { sessionName, sessionType };

    const sessionId = await EditorSessionService.createSession(userId, session);
    const returnObj = { sessionId };
    res.send(returnObj);
  } catch (err) {
    // res.sendStatus(500);
    throw err;
  }
};

exports.sessionId_get = async (req, res) => {
  try {
    const userId = UserService.getUserId(req.user);
    const { sessionId } = req.params;

    const returnObj = await SessionService.getInfoSessionByRole(sessionId, userId);
    res.send(returnObj);
  } catch (err) {
    throw err;
  }
};

exports.sessionId_question_get = async (req, res) => {
  try {
    const userId = UserService.getUserId(req.user);
    const { sessionId } = req.params;

    const returnObj = await SessionService.getListOfQuestionsByRole(sessionId, userId);
    res.send(returnObj);
  } catch (err) {
    // res.sendStatus(404);
    throw err;
  }
};

async function createAnonymousSession(req, userId) {
  try {
    if (!req.user) {
      const user = await UserService.getUserById(userId);
      const createSessionPromise = () => (
        new Promise((resolve, reject) => {
          req.login(user, (err) => {
            if (err) reject(err);
            resolve();
          });
        })
      );

      await createSessionPromise();
    }
  } catch (err) {
    throw err;
  }
}

exports.sessionId_question_post = async (req, res) => {
  const { title, content } = req.body;
  const question = { title, content };
  // const userId = UserService.getUserId(req.user);
  const rawUserId = UserService.getUserId(req.user);
  const userId = await UserService.validateUserId(rawUserId);

  await createAnonymousSession(req, userId);

  const { sessionId } = req.params;

  try {
    const questionId = await SessionService.addQuestionByRole(sessionId, userId, question);
    const returnObj = { questionId };
    res.send(returnObj);
  } catch (err) {
    // res.sendStatus(500);
    throw err;
  }
};

exports.sessionId_questionId_get = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId } = req.params;
    const userId = UserService.getUserId(req.user);

    const question = await SessionService.getQuestionByRole(sessionId, questionId, userId);
    res.send(question);
  } catch (err) {
    // res.sendStatus(404);
    throw err;
  }
};

exports.sessionId_questionId_vote_put = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId } = req.params;
    const rawUserId = UserService.getUserId(req.user);
    const userId = await UserService.validateUserId(rawUserId);

    await createAnonymousSession(req, userId);

    await SessionService.addVoteByRole(sessionId, questionId, userId);
    res.sendStatus(200);
  } catch (err) {
    // res.sendStatus(404);
    throw err;
  }
};

exports.sessionId_questionId_vote_delete = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId } = req.params;
    const userId = UserService.getUserId(req.user);

    await SessionService.cancelVoteByRole(sessionId, questionId, userId);
    res.sendStatus(200);
  } catch (err) {
    // res.sendStatus(404);
    throw err;
  }
};

exports.sessionId_questionId_status_put = async (req, res) => {
  try {
    const { questionId } = req.params;
    const status = req.body.Status;

    await EditorSessionService.updateQuestionStatus(questionId, status);
    res.sendStatus(200);
  } catch (err) {
    throw err;
  }
};

exports.sessionId_user_vote = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = UserService.getUserId(req.user);

    const listOfVotedQuestions = await SessionService.getListOfVotedQuestions(sessionId, userId);
    res.send(listOfVotedQuestions);
  } catch (err) {
    throw err;
  }
};

exports.sessionId_editor_get = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const listOfEditors = await SessionService.getListOfEditors(sessionId);
    res.send(listOfEditors);
  } catch (err) {
    throw err;
  }
};

exports.sessionId_editor_permission_post = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    await EditorSessionService.addEditor(sessionId, userId);
    res.sendStatus(200);
  } catch (err) {
    throw err;
  }
};

exports.sessionId_editor_permission_delete = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    await EditorSessionService.removeEditor(sessionId, userId);
    res.sendStatus(200);
  } catch (err) {
    throw err;
  }
};
