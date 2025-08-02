module.exports = class UmaError extends Error {
    constructor(message) {
        super(message);
        this.name = "UmaApiError";
    }
}