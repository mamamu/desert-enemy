module.exports={

  processResults:function(results, fieldArray){
    var Array=[];    
    results.forEach(function(result){ 
      var obj={};
       for (var i=0; i<fieldArray.length; i++){          
         obj[fieldArray[i]]=result[fieldArray[i]];
       }      
      Array.push(obj);
    })
    return Array;
  },
  
  generateDisplayArrays:function(objArray, fieldName){
    var Array=[];
    objArray.forEach(function(item){      
        Array.push(item[fieldName]) ;  
  })
    return Array;
  }
  
}