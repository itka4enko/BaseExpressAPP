const anonymizedEmail = (email) => {
    return email.replace(/(.{1}).+(.{1}@.+)/, "$1*****$2");
}

module.exports = {
    anonymizedEmail,
};
  