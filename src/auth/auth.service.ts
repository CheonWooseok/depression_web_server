import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const asyncAuthenticate = (
  cognitoUser: CognitoUser,
  authenticationDetails: AuthenticationDetails,
): Promise<any> => {
  return new Promise((resolve, _) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: resolve,
      onFailure: (err) => {
        let error: AuthenticateError = new AuthenticateError();
        error.code = err.code;
        error.name = err.name;

        resolve(error);
      },
    });
  });
};

class AuthenticateError {
  name: string;
  code: string;
}

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(@Inject('AuthConfig') private readonly authConfig: any) {
    this.userPool = new CognitoUserPool({
      UserPoolId: authConfig.userPoolId,
      ClientId: authConfig.clientId,
    });
  }

  async authenticate(username: string, password: string): Promise<any> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const userData = {
      Username: username,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    const tokenInfo = await asyncAuthenticate(
      cognitoUser,
      authenticationDetails,
    );

    if (tokenInfo instanceof CognitoUserSession) {
      return {
        accessToken: tokenInfo.getAccessToken().getJwtToken(),
        idToken: tokenInfo.getIdToken().getJwtToken(),
        refreshToken: tokenInfo.getRefreshToken().getToken(),
        expiresIn: tokenInfo.getAccessToken().getExpiration(),
      };
    } else if (tokenInfo instanceof AuthenticateError) {
      const error: AuthenticateError = tokenInfo;

      if (error.code === 'UserNotConfirmedException') {
        return {
          error: '인증 되지 않은 아이디입니다.',
        };
      } else if (error.code === 'NotAuthorizedException') {
        return {
          error: '아이디 혹은 비밀번호가 일치하지 않습니다.',
        };
      } else if (error.code === 'PasswordResetRequiredException') {
        return {
          error: '비밀번호를 초기화 해야 합니다.',
        };
      } else if (error.code === 'UserNotFoundException') {
        return {
          error: '존재하지 않는 아이디입니다.',
        };
      } else {
        return {
          error: '알 수 없는 에러가 발생했습니다.',
        };
      }
    }
  }
}
