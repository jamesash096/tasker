import React from 'react';
import './App.css';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      todoList:[],
      activeItem:{
        id:null,
        title:'',
        completed:false
      },
      editing:false,
    }
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentWillMount(){
    this.fetchTasks()
  }

  fetchTasks(){
    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(response => response.json())
    .then(data => 
      this.setState({
        todoList: data
      })  
    )
  }

  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    this.setState({
      activeItem: {
        ...this.state.activeItem, //This is to update the child items of 
        title:value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()

    var csrftoken = this.getCookie('csrftoken')
    var url = 'http://127.0.0.1:8000/api/task-create/'

    if(this.state.editing === true){
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing:false
      })
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem:{
          id:null,
          title:'',
          completed:false
        }
      })
    }).catch(function(error){
      console.log(error)
    })
  }

  editItem(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {
      this.fetchTasks()
    })
  }

  changeStrike(task){
    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({'completed': task.completed, 'title': task.title})
    }).then(() => {
      this.fetchTasks()
    })
  }

  render(){
    var tasks = this.state.todoList;
    var self = this
    return (
      <div className="container">
        <h2 id='main-title'>Tasker</h2>
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} Sid="form">
					    <div class="flex-wrapper">
						    <div style={{flex: 6}}>
							    <input onChange={this.handleChange} id="title" class="form-control" type="text" name="title" value={this.state.activeItem.title} placeholder="Add task" />
						    </div>
						    <div style={{flex: 1}}>
							    <input id="submit" class="btn" type="submit" />
						    </div>
					    </div>
				    </form>
          </div>

          <div id='list-wrapper'>
            {tasks.map(function(task, index){
              return(
                <div key={index} className="task-wrapper flex-wrapper">
                  <div onClick={() => self.changeStrike(task)} style={{flex:7}}>
                    {task.completed === false ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}
                  </div>

                  <div style={{flex:1}}>
                    <button onClick={() => self.editItem(task)} class="btn btn-sm btn-outline-info edit">Edit</button>
                  </div>

                  <div style={{flex:1}}>
                    <button onClick={() => self.deleteItem(task)} class="btn btn-sm btn-outline-dark delete">Remove</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
