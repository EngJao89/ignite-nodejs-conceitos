const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();

app.use(express.json())

const users = [];

function checksExistsUserAccount(request, response, next) {
 const {username} = request.headers

  const user = users.find((resp) => resp.username === username)

  if(!user){
    return response.status(400).json({message:  'User does not exist!' })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  users.push({
    id: uuidv4(),
    name,
    username,
    todo: []
  })

  const userExists = users.some((users) => users.username === username);

  if(!userExists){
    return response.status(400).json({message: 'Account already exists'});
  }

  return response.status(200).json({message: 'successfully registered user!'}).send()

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todo;

  return response.status(200).json({ todos: todos }).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title , deadline} = request.body
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date(),
  }

  user.todo.push(todo)
  return response.status(200).json({ message: "job successfully registered!"}).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title , deadline } = request.body
  const { id } = request.params
  const todo = user.todo.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ message: "Task not found!"}).send()
  }

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.status(200).json({message: "task updated successfully!" })
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params
  const todo = user.todo.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ message: "Task not found!"}).send()
  }

  todo.done = true
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todo.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return response.status(404).json({ message: "Task not found!"}).send()
  }

  user.todo.splice(todoIndex, 1)

  return response.status(204).send()

});

module.exports = app