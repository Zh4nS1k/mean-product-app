import bcrypt from 'bcryptjs';

const password = 'password123';

const hashPassword = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed Password:', hashedPassword);
};

hashPassword();
