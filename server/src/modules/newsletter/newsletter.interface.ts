export interface NewsletterSubscribePayload {
  email: string;
  name?: string;
}

export interface NewsletterSubscribeResult {
  alreadySubscribed: boolean;
  email: string;
  newsLadderId: string;
}

