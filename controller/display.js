
$(function() {
  //get the external file that contains the functions for displaying the voting/option lists.  this wraps the whole page.
  $.getScript( 'listdisplay.js', function() {
  
  refreshPolls();  
  
//nearly everything is wrapped in the refresh Polls function which is called on ready so that when you do one of the actions below 
  //i.e. vote, the whole dom is updated to reflect it.  this is handled differently on the profile page, and so that one doesn't have same structure
  //even though it's doing many similar things
function refreshPolls() {
  let param = (new URL(location)).searchParams;  
  var page = param.get('page');  
   $('#pollspot').empty();
  //get the list of polls and then display
   $.get('/polls'+page, function(polls) {      
    polls.forEach(function(poll) {
      var p=poll.poll_name+'<span class="hidden">'+poll._id+'</span>';      
      $('<div class="bar"></div>').html(p).appendTo('#pollspot');  
    });
     //paginate polls
     if (polls.length===10){
       if (page===null){
         $('<div class="paginate"></div>').html('<a class="paginate" href="https://desert-enemy.glitch.me/?page=10">next</a>').appendTo('#pollspot');
         }
       else if (page>=10){
         var next = parseInt(page)+10;
         $('<div class="paginate"></div>').html('<a class="paginate" href="https://desert-enemy.glitch.me/">back</a><a class="paginate" href="https://desert-enemy.glitch.me/?page='+ next +'">next</a>').appendTo('#pollspot');
         }      
       }
     else {
       var prev = parseInt(page)-10;
       $('<div class="paginate"></div>').html('<a class="paginate" href="https://desert-enemy.glitch.me/?page='+ prev +'">back</a>').appendTo('#pollspot');
     }
     //when you click one of the listed polls process old info on the page, then get the poll id, call the function that loads options using listdisplay.js
    $('.bar').click(function(){
      $('#directions').text('Click a Poll Option to vote or click another poll to view data')
      $('.selectedPoll').removeClass('selectedPoll');
      $('#results').remove();
      $('#myChart').empty();      
      $(this).addClass('selectedPoll');
      $('<container id="results"></container>').appendTo(this);
      var id=$(this).find('.hidden').text(); 
      getPageOptions(id);
     
     
      //call external chartdisplay.js file and then call funtion in that file to get chart
      $.getScript( 'chartdisplay.js', function() {  
        getDisplay(id);  
      }) 
          
      
    });
    //end bar click function  
    
  }); 
  //end get polls
}
    
});
  //this one closes out the getscript that is for listdisplay.js, as opposed to the final one for the document function
  
})