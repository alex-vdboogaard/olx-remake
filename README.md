# OLX remake
A remake of the popular platform, OLX, which was discontinued by its owner company, Naspers. 
## Demo
https://github.com/alex-vdboogaard/olx-remake/assets/51801994/605dab17-f5d3-447b-b91e-9b4242937eb1
## How to seed data:
- First run ``` npm i ```, and make sure you have [MongoDB](https://www.mongodb.com/docs/core/administration/install-community/) installed on your machine.
- Run ``` nodemon index.js ```
- Open your browser and type ``` http://localhost:3000/ ``` in the address bar and click enter
- You should see a basic home page
- In the address bar, add ```/seed-data``` and click enter.
- There should be a success message if the data was loaded.
- Test it by going to the login page and clicking login with the prefilled details

## Log in as admin
- Go to the login page
- Type ``` anakin_skywalker ``` as the username
- Type ``` Admin1234!! ``` as the password
- Click log in

## Tech stack
### Front end
- HTML,CSS, JavaScript
### Back end
- Next.js
- Express
- MongoDB
