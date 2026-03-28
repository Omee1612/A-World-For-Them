const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: '69c7d6b51476672d510111e1' }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
const form = new FormData();
form.append('name', 'testdog');
form.append('age', '1');
form.append('trait', 'friendly');
form.append('location', 'testplace');
form.append('contact', '12345');
form.append('description', 'test description');
const filePath = path.join(__dirname, 'uploads', fs.readdirSync(path.join(__dirname, 'uploads'))[0]);
form.append('image', fs.createReadStream(filePath));

fetch('http://localhost:5000/adoptions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: form,
})
  .then((res) => res.json().then((body) => console.log('status', res.status, 'body', body)))
  .catch((err) => console.error(err));
