pragma solidity ^0.4.18;
//Author: Joe Nance
//Title: Nceno goal object, creation, and registry

//Description: After GoalFactory is deployed, a user can type some parameters and with a single click, a new goal will be deployed
//with those parameters and (separately) loaded with the intended stake. The GoalFactory contract also acts as a registry where the admin can 
//retreive a list of all goals ever set by a fitbitID (user ID).



contract GoalFactory {
  PocGoal createdGoal;
  
  //make a record for each player of their goals
  struct PlayerGoalHistory{
     address[] hostedGoals;
    }
  
  //make a registry of all goals, accessible by a fitbitID
  mapping (uint => PlayerGoalHistory) goalsByFitbit;
  address[] goalList;

  //set nceno as admin
  //address nceno = 0x27BD6D3fD046Fb3A6b073C55061f952873ADB0Cf; //address 1 metamask rinkeby net

//spawn a new goal with intended parameters
  function createGoal(string _name,string _email,uint _fitbitID,uint _activeMinutes,uint _rounds,uint _roundLength, string _beginAt,string _endAt,uint _stake) public returns(address) {
      address creator = msg.sender;
      createdGoal = new PocGoal(creator, _name,_email,_fitbitID,_activeMinutes,_rounds,_roundLength,_beginAt,_endAt,_stake);
      //add it to the registry
      goalList.push(createdGoal);
      //add it to the player's history
      goalsByFitbit[_fitbitID].hostedGoals.push(createdGoal);
      return address(createdGoal);
    }
  
  //get the address of the most recently created goal
  //function getContractAddress() public constant returns (address) {
      //return address(createdGoal);
    //}

//get the total number of goals created so far
  function getGoalCount() public view returns (uint) {
      return goalList.length;
    }
  
 //get a list of all the goals created
  function getAllGoals() public view returns (address[]) {
      return goalList;
    }
  
 //lookup function. Given a fitbitID, return a list of all goals associated to it.
  function getGoalsByFitbitID(uint _fbID) view public returns (address []) {   
        return goalsByFitbit[_fbID].hostedGoals;
    }
    
  //lookup function. Given a fitbitID, returns the address of the last goal deployed by it.
  function getLastGoalByFitbitID(uint _fbID) view public returns (address ) {   
        uint theLast = goalsByFitbit[_fbID].hostedGoals.length -1;
        return goalsByFitbit[_fbID].hostedGoals[theLast];
    }

    
}
//end of GoalFactory contract


contract PocGoal {
  //name
  string name;
  //email address for corespondence
  string email;
  //how many minutes of activity for this goal?
  uint activeMinutes;
  //number of total workouts in the goal
  uint rounds;
  //number of days per rounds
  uint roundLength;
  //when does the clock start?
  string beginAt;
  //when the goal ends
  string endAt;
    //how much ether will you stake?
  uint stake;
  //last 5 digits of phone number
  uint fitbitID;
  //user address where stake is returned in the case of a win
  address owner;
  //Nceno address where lost stake goes (as our revenue)
  address nceno;
  
  //only admin modifier (assumes Nceno wallet address is the admin)
    modifier onlyNceno {
        require(msg.sender == nceno);
        _;
    }

  
    //constructor, called by GoalFactory to instantiate contract
  function PocGoal(address _goalOwner, string _name,string _email,uint _fitbitID,uint _activeMinutes,uint _rounds,uint _roundLength,string _beginAt,string _endAt,uint _stake) public {
      owner = _goalOwner;
      name =_name;
        email = _email;
        fitbitID = _fitbitID;
        activeMinutes = _activeMinutes;
        rounds = _rounds;
        roundLength = _roundLength;
        beginAt = _beginAt;
        endAt = _endAt;
        stake = _stake;

    //addresses where lost stake goes
    //nceno = 0x27BD6D3fD046Fb3A6b073C55061f952873ADB0Cf; //address 1 metamask rinkeby net
    // nceno = 0x441bd7Cd53a00fa8ba5CEb6FbDEa0bB4d5Eca8DE; //address 2 ganache
    // nceno = 0x5e67903bbf7ea3c5f54bd2b81e3d96ee2d12394a; //status.im mainnet account 1
    nceno = 0x861CD7c8b659cF685B7d459a6710DFfdc305464b; //metamask mainnet account 2 (admin also)
    }
  
  //makes the contract able to hold some ether
  function depositStake() public payable {  }
  
  //returns stake to user when they win a milestone. Funds go to the address that created the goal.
  function winStake() onlyNceno public payable{
        
        owner.transfer(address(this).balance);
        
    }
//sends lost stake to nceno wallet (set above)
  function loseStake() onlyNceno public payable{
        
        nceno.transfer(address(this).balance);
    }

  //see the goal details
  function getGoal () public constant returns (address, string, string, uint, uint, uint, uint, string, string, uint, uint256){
      uint256 bal = address(this).balance;
      return(owner,name,email,fitbitID,activeMinutes,rounds,roundLength,beginAt,endAt,stake,bal);
  }
  
//end of contract
}  