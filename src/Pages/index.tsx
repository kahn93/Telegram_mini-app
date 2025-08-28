import React from 'react';

  
  const  = () => {
    return (
      <div className="container">
        <div className="row">
            <div className="col-md-3 my-2">
                            <input type="text" className="form-control" name="inputBox1" placeholder="Input 1" />
                         </div>
<div className="col-md-3 my-2">
                            <input type="text" className="form-control" name="inputBox2" placeholder="Input 2" />
                         </div>
<div className="col-md-3 my-2">
                            <input type="text" className="form-control" name="inputBox3" placeholder="Input 3" />
                         </div>
<div className="col-md-3 my-2">
                            <input type="text" className="form-control" name="inputBox4" placeholder="Input 4" />
                         </div>
<div className="col-md-3 my-2">
                            <textarea className="form-control" placeholder="Textarea 1"></textarea>
                         </div>
<div className="col-md-3 my-2">
                            <textarea className="form-control" placeholder="Textarea 2"></textarea>
                         </div>
<div className="col-md-3 my-2">
                            <select className="form-control">
                              <option>Option 1</option>
                              <option>Option 2</option>
                              <option>Option 3</option>
                            </select>
                         </div>
<div className="col-md-3 my-2">
                            <input type="radio" name="radioGroup1" /> Option 1
                         </div>
<div className="col-md-3 my-2">
                            <input type="radio" name="radioGroup2" /> Option 2
                         </div>
<div className="col-md-3 my-2">
                            <input type="checkbox" /> Checkbox 1
                         </div>
<div className="col-md-3 my-2">
                            <input type="checkbox" /> Checkbox 2
                         </div>
<div className="col-md-3 my-2">
                            <input type="checkbox" /> Checkbox 3
                         </div>
<div className="col-md-3 my-2">
                            <input type="search" className="form-control" name="inputLookup1" list="inputLookup1" placeholder="InputLookup 1" />
                            <datalist id="inputLookup1">
                              <option value="San Francisco" />
                              <option value="New York" />
                              <option value="Seattle" />
                              <option value="Los Angeles" />
                              <option value="Chicago" />
                            </datalist>
                         </div>

        </div>
      </div>
    );
  };

  export default ;
  