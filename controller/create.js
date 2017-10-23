$(function() {  
  var pollname;
  var new_poll_id;
  //first submit a name and get back the poll object to get the _id 
  $('#pollname').submit(function(event) {    
    event.preventDefault();
    pollname = $('#name').val();    
    $('h2').text(pollname);
    $('#pollname').toggleClass('hidden');
    $('#options').toggleClass('hidden');
    $.post('/create/new/' + pollname, function(poll){      
      new_poll_id=poll._id
    }); 
   });
 
  //for each option on the page, get the value, then submit with the _id obtained above
   $('#options').submit(function(event) {       
        event.preventDefault();     
      $(".option").each(function() {
        var option=$(this).val();        
        $.post('/create/id/' + new_poll_id +"/"+option, function(){
       }); 
    });
    //when you're done get rid of the stuff on the page to bring it back to normal 
   $('h2').empty();
   $('input').val('');
   $('#pollname').toggleClass('hidden');
   $('#options').toggleClass('hidden'); 
     $('input').focus();
   });
 

     
  

});
