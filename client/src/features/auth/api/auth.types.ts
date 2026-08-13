export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly name?: string | null;
}

export interface AuthenticationUserDto {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
  readonly roles?: readonly string[];
}

export interface AuthenticationResponse {
  readonly accessToken: string;
  readonly user: AuthenticationUserDto;
}

export interface LogoutResponse {
  readonly ok: true;
}
