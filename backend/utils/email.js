const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const config = require('../config/config');
const logger = require('./logger');
const AppError = require('./appError');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name?.split(' ')[0] || 'User';
    this.url = url;
    this.from = `AI Proctoring <${config.email.from}>`;
  }

  /**
   * Create a transport for sending emails
   * @returns {Object} Nodemailer transport
   */
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid', // No need to set host or port
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Use Mailtrap for development
    return nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass,
      },
    });
  }

  /**
   * Send an email
   * @param {string} template - Template name (without extension)
   * @param {string} subject - Email subject
   * @param {Object} templateVars - Variables to pass to the template
   */
  async send(template, subject, templateVars = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...templateVars,
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
      logger.info(`Email sent to ${this.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new AppError('There was an error sending the email. Try again later!', 500);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome() {
    await this.send('welcome', 'Welcome to AI Proctoring!');
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }

  /**
   * Send password reset success email
   */
  async sendPasswordResetSuccess() {
    await this.send(
      'passwordResetSuccess',
      'Your password has been reset successfully'
    );
  }

  /**
   * Send exam reminder email
   * @param {string} examName - Name of the exam
   * @param {Date} examDate - Date and time of the exam
   */
  async sendExamReminder(examName, examDate) {
    await this.send('examReminder', 'Upcoming Exam Reminder', {
      examName,
      examDate: new Date(examDate).toLocaleString(),
    });
  }

  /**
   * Send exam results email
   * @param {string} examName - Name of the exam
   * @param {number} score - User's score
   * @param {number} maxScore - Maximum possible score
   */
  async sendExamResults(examName, score, maxScore) {
    await this.send('examResults', 'Your Exam Results', {
      examName,
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
    });
  }
}

module.exports = Email;
