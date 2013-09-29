CoderCombat
===========
<h3>Brief Non-Technical Description </h3> 
<p>Coder Combat is a real time one on one programming competition over the web. 
It attemps to simulate the emotions felt in a technical interview while also improving your programming skills. 
Competitors are paried up in a room and are then given an algorithm to solve. During the match each player will
be able to see up to date progress on where their competitor is at at all times. Once someone solves the algorithm,
the winner and loser will both be notified and a ten second countdown will prepare both competitors for the next match.
</p>

<img src="http://www.tylermcginnis.com/images/coderCombatSearching.png" alt="Coder Combat Searching" />
<br />
<br />
<br />
<img src="http://www.tylermcginnis.com/images/CoderCombatRoom.png" alt="Coder Combat Room" />
<br />
<br />
<br />
<img src="http://www.tylermcginnis.com/images/WinnerModal.png" alt="CoderCombatWinner"/>
<br />
<br />
<br />
<img src="http://www.tylermcginnis.com/images/LoserModal.png" alt="CoderCombatWinner"/>
<br />
<br />
<br />
<h3> Technical Description </h3>
<p>Coder Combat utilizes various technologies including 
  <img src="http://www.tylermcginnis.com/images/coderCombatStack.png" alt="Coder Combat Tech Stack"/>
</p>
<p> I use Angular.js on the front end with the two text editors being Directives, and a Socket.IO, Http, and CountDown 
service. My schema for Mongo involves a Title, Question, Parameter, and Answer. When a user clicks submit, an ng-click 
event is fired, I then take the code that was in his or her editor, parse it to be in the correct format, pass in the 
Parameter from the DB, evaluate it, then compare the result to the actual answer. </p>
<p> Socket.IO is the main contributer of this application. I used Sockets in order to keep a constant live stream 
going between both users and their editors. </p> 
<br /><br />
<h3> Challenges </h3> 
<p> The biggest challenges I faced were definitely related to Sockets and more specifically the use of rooms with 
sockets. For every connection that is made, I categorize that user into a specific room based on a certain algorithm. 
Being a live game, the user has the option to stay, disconnect, or refresh. This leads to a vast array or 
certain behavior that could happen in one specific room. This behavior needed to be somehow connected with other rooms
and the behavior of the users in that room. For example, if there are two rooms each containing two users, the game
needs to be able to detect if both rooms have someone disconnect, and then pair those remaining users. 
</p>
<br />
<img src="http://www.tylermcginnis.com/images/CoderCombatWaiting.png" alt="CoderCombat Waiting"/>



