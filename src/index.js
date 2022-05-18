const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const verifiedUser = users.find((user) => user.username === username)

  if (!verifiedUser) {
    return response.status(404).json({ error: "User not found!" })
  } else {
    request.verifiedUser = verifiedUser
    return next()
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request

  return response.json(verifiedUser.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { verifiedUser } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  verifiedUser.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  const { verifiedUser } = request

  if (!verifiedUser.todos.some((todo) => todo.id === id)) {
    return response.status(404).json({ error: "ToDo not found!" })
  }

  const todo = verifiedUser.todos.find((task) => task.id === id)

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { verifiedUser } = request

  if (!verifiedUser.todos.some((todo) => todo.id === id)) {
    return response.status(404).json({ error: "ToDo not found!" })
  }

  const todo = verifiedUser.todos.find((todo) => todo.id === id)

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { verifiedUser } = request

  if (!verifiedUser.todos.some((todo) => todo.id === id)) {
    return response.status(404).json({ error: "ToDo not found!" })
  }

  verifiedUser.todos = verifiedUser.todos.filter((todo) => todo.id !== id)

  return response.status(204).send()
});

module.exports = app;