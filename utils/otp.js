// Simulating OTP sending and verification for demonstration purposes
const sendOTP = (phone) => {
    return new Promise((resolve, reject) => {
      // Simulate OTP sending
      setTimeout(() => {
        resolve({ otp: '1234' }); // Simulated OTP
      }, 2000); // Simulate 2 second delay
    });
  };
  
  const verifyOTP = (phone, otp) => {
    return new Promise((resolve, reject) => {
      // Simulate OTP verification
      setTimeout(() => {
        resolve(otp === '1234'); // Simulate OTP verification success
      }, 1000); // Simulate 1 second delay
    });
  };
  
  const generateQR = (qrValue) => {
    return new Promise((resolve, reject) => {
      // Simulate QR code generation
      setTimeout(() => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrValue)}`;
        resolve({ qrCodeUrl });
      }, 500); // Simulate 0.5 second delay
    });
  };
  
  module.exports = {
    sendOTP,
    verifyOTP,
    generateQR
  };
  