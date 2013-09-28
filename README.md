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
<h3> Technical Description </h3>
<p>Coder Combat utilizes various technologies including 
  <ul>
    <li> HTML5 </li>
    <li> CSS 3 </li>
    <li> Angular.js </li>
    <li> Socket.IO </li> 
    <li> Node.js </li>
    <li> Express.js </li>
    <li> MongoDB </li>
    <li> Mongoose </li>
  </ul>
</p>
<p> I use Angular.js on the front end with the two text editors being Directives, and a Socket.IO, Http, and CountDown 
service. My schema for Mongo involves a Title, Question, Parameter, and Answer. When a user clicks submit, an ng-click 
event is fired, I then take the code that was in his or her editor, parse it to be in the correct format, pass in the 
Parameter from the DB, evaluate it, then compare the result to the actual answer. </p>
<p> Socket.IO is the main contributer of this application. I used Sockets in order to keep a constant live stream 
going between both users and their editors. </p> 



