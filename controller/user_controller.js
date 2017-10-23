$(function() {  
  gotUser();
  
  
function gotUser(){
    $.get('/authRoute', function(user){
      //assign a value for name
      var name;
      if (user.username==null||user.username==""){
        name="Mr/Ms/Mx X";
      } else {
        name=user.username;
      }
      
      //change the logon/logoff and greet the user
      if (user.user_id){        
        //$('#temp').html("Hi  "+name+"!!!!!");
        $('#logoff').removeClass('hidden');
        $('#login').addClass('hidden');
        
      } else if (!user.user_id){        
        $('#logoff').addClass('hidden');
        $('#login').removeClass('hidden');
      }
      
   })
  }
  

  

})
  
  
  
