# Simple Mail Receipt

*This simple server receives mail, parses it and creates a task in Twilio Flex*

## Setup

### Mail Server DNS Setup

In order to receive emails, your smtp server address should be made available somewhere. Two records should be added to your DNS records. Let us pretend that we want to receive emails at ```*@subdomain.domain.com```:
* First an MX record: ```subdomain.domain.com MX 10 subdomain.domain.com```. This means that the mail server for addresses like ```*@subdomain.domain.com``` will be ```subdomain.domain.com```.
* Then an A record: ```subdomain.domain.com A the.ip.address.of.your.server```. This tells at which ip address the mail server can be found.

### Create "Email" Task Channel

We need to establish a custom channel for emails in flex.  While we are in the Twilio console we can grab our account keys.

Twilio Console > Task Router > Workspaces > Task Channels > Create New Task Channel > “Email”

## Development and Testing

Update the constants in the twilio.js file to use your own account.

To get your local server running use:
`sudo npm start`

One your server is running you can send it a test locally:
`sendmail test@localhost < ./email-test.txt`
