export class AuthenticationError extends Error {
  constructor(message = "인증되지 않은 사용자입니다.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "권한이 없습니다.") {
    super(message);
    this.name = "AuthorizationError";
  }
}
