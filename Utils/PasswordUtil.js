// Generates a random alphanumeric password

const generateRandomPassword = () => {
    const length = 10; // Length of the generated password
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
  
    return password;
  };
  
  export { generateRandomPassword };
  