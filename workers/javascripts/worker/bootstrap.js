(function(){
    function hasGears(){
        return window.google && google.gears && google.gears.factory;
    }
    
    function hasWebWorker(){
        return typeof window.Worker != "undefined";
    }
    
    var concreteWorker = hasWebWorker() ? JsWorker.WebWorker : (hasGears() ? JsWorker.GearsWorker : JsWorker.TimeoutWorker);
    
    JsWorker.createWorkerFromUrl = function(){
        return concreteWorker.createWorkerFromUrl.apply(this, arguments);
    };
    
    JsWorker.createWorkerFromText = function(){
        return concreteWorker.createWorkerFromText.apply(this, arguments);
    }
    
})();
