const fs = require('fs');
const express = require('express');
const { allowedNodeEnvironmentFlags } = require('process');
const app = express();
app.use(express.json());
app.use((req,res,next)=>{
  console.log('hello from the midlleware');
  next();
});

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const getAlltours =  (req, res) => {
  res.status(200).json({
    status: 'succes',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour =  (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  if(id > tours.length){
    return res.status(404).json({
      status:'fail',
      message:'invalid ID'
    });
  }
  const tour = tours.find(el =>el.id === id);
   res.status(200).json({
    status: 'succes',
    data: {
      tour
    },
  });
};

const creatTour = (req, res) => {
  //console.log(req.body);
  const newID = tours[tours.length - 1].id + 1;
  const newtour = Object.assign({ id: newID }, req.body);
  tours.push(newtour);

  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'succes',
        data: {
          tour: newtour,
        },
      });
    }
  );
};

const updateTour = (req ,res)=>{
  if(req.params.id * 1 > tours.length){
    return res.status(404).json({
      status:'fail',
      message:'invalid ID'
    });
  }
  res.status(200).json({
    status:'succes',
    data:{
      tour:'<updated tour here....>'
    }
  });
};

const deleteTour = (req ,res)=>{
  if(req.params.id * 1 > tours.length){
    return res.status(404).json({
      status:'fail',
      message:'invalid ID'
    });
  }
  res.status(204).json({
    status:'succes',
    data:null
  });
};

app
  .route('/api/v1/tours')
  .get(getAlltours)
  .post(creatTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);  

const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
