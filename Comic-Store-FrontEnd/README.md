# Comic Bookstore

## Introduction

The main objective of my comic store project is to create a user-friendly interface where comic book readers can browse, purchase, and search for comic book titles. I will use ReactJS to create a seamless and simple front-end interface, while Flask will be the framework for obtaining and processing the API requests at the back end, which the front-end cannot perform. The scalability of MongoDB makes it perfect for holding comic book information as data. MongoDB is more suited to large scale applications, but I decided to use it so I can learn it and get my hands dirty. I will use Docker in the project so that I can keep its parts in containers, keep it organized and keep it easier to maintain.

## Requirements of the Project

- Give users an easy-to-navigate site  
  - Create a UI that guides the user through the design  
  - Make it accessible to those with impairments  
    - Section 508  
    - Make sure the screen reader makes sense when it reads it  
  - Make sure UX is enjoyable for the consumer  
- Allow users to create accounts/log in  
  - Authenticate users  
  - Securely store login info and account info  
- Allow users to search through books  
  - Adding items to wish lists/cart and removing them  
  - Remove books from the cart after a given time  
  - Saving info of the books the user saves in the database  
- Create relationships between the tables  
- Store books in a database that the site can read from  
  - Create a MongoDB database  
  - Store user login so that it can be linked to other tables  

## Technology Used in the Project

This project will use various technologies and libraries, including:

- ReactJS  
- Docker  
- Bootstrap/Tailwind  
- Flask-Python  
- MongoDB  
- Digital Ocean  

I chose ReactJS because I'm familiar with it, and it makes building my site's user interface much easier. It is also a lightweight framework that gets frequent updates and has excellent documentation. This documentation helps me find information on completing tasks and designing features for my project. Since ReactJS is lightweight, it improves load speeds, making the site feel smooth. I like how simple it is to manage state and pass data between components. It also works with the tools I’m using, like Flask and MongoDB.

I'm using Flask for the backend of my project because it works well with the frontend. Flask is a lightweight framework that is great for routing, handling API requests, and manage server-side logic without adding too much complexity. Flask is great for building RESTful APIs because of how simple it is. This will allow me to make an API that communicates well with the front end. It also works well with the MongoDB database, which allows for efficient data handling.

Flask uses Python which is slowing becoming more standard in the industry. And because of its popularity it is also getting a lot of support and libraries that can be useful. Python also has support for data manipulation and tools like Docker and MongoDB ensuring that the backend is maintainable and consistent.

Bootstrap and Tailwind are both libraries that I can use for styling and adding components to my pages to make it easier to navigate. Using these also makes things easier because instead of using my own functions made from scratch, I can read their well-made documentation and incorporate different elements into my project like button types, carousels, and other ways of displays or navigating through information and books.

MongoDB is the database type I chose to use for my project so I can learn a skill that will be useful later, but also because it will work well with what I am doing even though my project isn’t large scale. And since I’m using ReactJS and Flask it means I can store quickly and efficiently. MongoDB can handle large amounts of data without slowing down, even though this is nice I highly doubt it will get to that scale. The integration with Flask is smooth, and there are plenty of libraries and tools available to help me manage connections, queries, and data validation.

Using Docker is going to help me stay organized and keep things manageable so I know exactly which piece I need to target. This is because I can use containers to isolate my backend, frontend, and database, and deploy them into separate environments that run across different machines. This solves issues from different operating systems and dependencies. Docker also simplifies deployment, since I can outline my application requirements in a single, configuration file. It works well with Flask and MongoDB, this helps the app be portable, scalable, and easier to manage.

## Platform

I’m using Digital Ocean because it is cheap to set up and it is compatible with my project and works well with Docker. Digital Ocean is also a platform that I have some familiarity with and whatever I don’t know, I can easily find because it is well documented and supported. It will also allow me to show my project to people on many different devices because it will be on the web in a server, so I don’t have to worry as much about different hardware affecting my project.

## Gantt Chart

### Sprint 1

- Plan Project  
  - Research websites like what I am making and see what design I want to go for  
  - Draw out a design for the front page and think of the other pages I want to create in terms of design  
  - Look into the UI elements I can get from Bootstrap and Tailwind  
  - Begin figuring out how I’m going to set up Docker containers  
- Begin Front End  
  - Build up the appearance and layout of the front page and create the other pages as well  
    - Just layout the design not worrying about functionality  
    - Only function should be navigation  
  - Go through the current code I have and make sure it is well organized  
  - Adjust UI if I think I need to. I am doing it now before I must rewrite entire functionality  
- Finish Front End  
  - Build in functionality to each part of the pages  
    - The parts that later will need the backend connected to work won’t have functionality  
  - While I’m doing this, I will finalize my database design and start creation  
    - I will try to complete this before sprint 2 but I might have to take a couple of extra days to finish it  
    - Begin putting in data like Books (Cover, summary, price, name)  

### Sprint 2

- Learn Flask and Research  
  - Watch videos on how to connect the Flask backend to the ReactJS frontend  
    - Research on connecting to the database and sending and receiving data too  
    - At most I will take 2 more days just to get more comfortable with the concepts  
  - Finish setting up Flask backend in the project (just basic setup)  
- Finish Flask Backend  
  - Create unit testing files (this will be done throughout the sprint even though it is only a tiny bar in the Gantt Chart)  
  - Build in functions for sending, receiving and requesting data from the database  
    - Figure out how to add authentication so that there is more security for the user  
    - Write up unit tests for functions in the backend  
  - Finalize and fix up issues with the database (if there are any)  
    - Go back through and clean up code  
  - Run a test run to see if everything works one last time before deployment starts  
- Add authentication now that I figured it out  
  - Finish unit tests  
- Complete MongoDB setup  
  - Basically, any fine tuning needed to get it fully operational  

### Sprint 3

- Any backlog should be done by this point  
- Clean up formatting, code and design (just finishing touches)  
- Deployment in Digital Ocean  
  - Set up the server and perms  
  - Upload/connect the containers to the server  
  - Make sure that it runs correctly  
- Bug fix  
  - Just general fixes before demo  

## Works Cited

- Cloud infrastructure for developers. DigitalOcean. https://www.digitalocean.com/  
- Get started. Docker Documentation. https://docs.docker.com/get-started/  
- MongoDB docs. What is MongoDB? - Database Manual - MongoDB Docs. https://www.mongodb.com/docs/manual/  
- Welcome to Flask. Welcome to Flask - Flask Documentation https://flask.palletsprojects.com/en/stable  


This version preserves your original structure and content while ensuring proper Markdown formatting for GitHub. Let me know if you'd like help adding navigation links, badges, or deployment instructions.
