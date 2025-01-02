import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthService {
  private oauthClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.oauthClient = new OAuth2Client(clientId);
  }

  /**
   * Validate the Google ID Token
   * @param idToken The token received from the client
   * @returns A promise containing the decoded payload
   * @throws UnauthorizedException if validation fails
   */
  async validateGoogleToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'), // Ensure audience is fetched properly
      });
      const payload = ticket.getPayload();

      // console.log('====================');
      // console.log(ticket);
      // console.log('====================');
      // console.log(payload);
      // console.log('====================');

      // Validate required fields
      if (!payload || !payload.email_verified) {
        throw new UnauthorizedException('Invalid Google user');
      }

      return payload; // Contains user info like email, name, etc.
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }
}
