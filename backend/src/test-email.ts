import { sendMail } from './utils/mailgun';

const testEmail = async () => {
  try {
    await sendMail(
      'shaquillendunda@gmail.com',
      'Test Email',
      'Hello! This is a test email from Mailgun.'
    );
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};

testEmail();
