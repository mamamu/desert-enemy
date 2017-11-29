Free Code Camp voting app project

Created using Express.  Database using Mongodb/Mongoose.  Oath2 access for users of Github and Google using Passport. Charts with Chartjs.


---------------------

Features:

* poll list display with votable options list and charts of total votes for each option opening on click.
    * Poll list includes:
      - indication of prior user votes and disabling of voting functionality       for that poll
      - Pagination
* voting by authenticated and unauthenticated (IP) users
* user profile for authenticated users.  
    * Profile contains: 
      -  list of polls created by user with options to share or delete user created polls.
      -  list of polls user voted on.
      -  chart of all polls created by user with number of total votes in each poll
* poll creation for authenticated users with potential for infinately adding options on poll creation page.
* new option creation for authenticated users on *any* poll that they have not already voted in.
* custom error messages for common errors



