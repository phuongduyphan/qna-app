module.exports.insertQuery = "INSERT INTO ?? SET ?";

module.exports.selectAllQuery = "SELECT * FROM ?? WHERE ?? = ?";

module.exports.selectQuery = "SELECT ?? FROM ?? WHERE ?? = ?";

module.exports.selectAllQueryWithConstraints = "SELECT * FROM ?? WHERE ?? = ? LIMIT ? ORDER BY ??";

module.exports.selectQueryWithConstraints = "SELECT ?? FROM ?? WHERE ?? = ? LIMIT ? ORDER BY ??";

module.exports.selectAllQueryWithTwoConstraints = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";

module.exports.selectAllQueryWithTwoConstraints2 = "SELECT * FROM ?? WHERE ?? = ? AND ?? <> ?";