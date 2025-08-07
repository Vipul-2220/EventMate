Build a web app EventMate using MERN Stack, React for frontend, NodeJS/Express for backend and MongoDB for database, to manage events. Use folder structure frontend and backend.
Create a beautiful Landing Page with animations and transitions.

Use role based authentication (admin/user).
Users can see the list of events
Admins can see the list of existing events and option to create new events.


Compiled with problems:
ERROR in ./src/pages/Dashboard.js 207:42-50
export 'User' (imported as 'UserIcon') was not found in '@mui/icons-material' 

Add authentication screen with signup and login.
Use mongodb to store user details and hashPassword.
Use role based authentication for users show only list of events
For admin add a feature to create new evetn

Once the user successfully logs in show the list of events.
Once the admin logs in show the list of events with feature to add new event

The flow is not working.
Role based authentication, if user login show list of events
If admin login show events with feature to add new events.
Add checks for incorrect email, password and other cases.

@auth.js @auth.js @Login.js @Register.js The authentication is not working. Recheck the flow with backend. While creating a new user the details are not being stored in database, as well as the login feature is not working. The page is stuck on auth screens

http://localhost:3000/events route is not working
Warning: Failed prop type: Invalid prop `children` supplied to `ForwardRef(Typography)`, expected a ReactNode.

ERROR
Objects are not valid as a React child (found: object with keys {address, city, state, zipCode}). If you meant to render a collection of children, use an array instead.
throwOnInvalidObjectType@http://localhost:3000/static/js/bundle.js:78397:13

There will be only one admin with specific credentials for this application who will be able to add new events.
Other than that all users are only users. From Dashboard remove "Role" and "My Events". Only show list of registered events.

as we are storing role in user model. On signup page add option to choose as - "Organiser" or "Audience", if user chooses "Organiser" make the role as admin, if the user choses "Audience" make the role as user

Instead of a dropdown add 2 grey tab buttons just before create account 

On select it should change color to primary color of the application also move it after password confirmation just before create account button

I've created a test user by selecting "Organiser" on signup page still the role is "user" instead it should be "admin". Review the code and make necessary changes for role to be admin when Organiser selected and user when Audience selected

Remove Dashboard and view user details on profile page. 
Impement EventsDetailScreen where user can view the event details and join the event.

Uncaught runtime errors:
ERROR
Objects are not valid as a React child (found: object with keys {address, city, state, zipCode}). If you meant to render a collection of children, use an array instead.
throwOnInvalidObjectType@http://localhost:3000/static/js/bundle.js:76988:13

When user clicks on Register for Event. Show a confirmation, once user confirms add user to that event. Generate an E-ticket in pdf format available after registration

Once I confirm registration for a event I see this:
Event Not Found

No token, authorization denied

Instead show me a successfull message that I have been registered in the event, and generate a pdf ticket available to download from both the events detail screen and profile page

In profile section do not show option to generate e-ticket instead show option to only download the ticket generated at events detail screen, also every time I click on a registered event I should see the option to download my ticket.
Add a QR Code in the pdf which will show user details and registered event details 

The problem still persists, add some debug statements to find and fix the errors
