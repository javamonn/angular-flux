(function() {
  'use strict';

  const TodoRecord = Immutable.Record({
    id: cuid(),
    complete: false,
    text: "Experiment with Angular and Reflux"
  });

  let TodoStore = function(TodoActions, PersistStore) {

    let _todos;

    let todoStore = Reflux.createStore({
      listenables: [TodoActions],
      onCreate: function(text) {
        _updateTodos(_todos.push(new TodoRecord({
          text: text,
          id: cuid()
        })));
      },
      onUpdateText:function(id, text) {
        let [index, todo] = _todos.findEntry(todo => todo.id == id);
        _updateTodos(_todos.set(index, todo.set("text", text)))
      },
      onToggleComplete: function(id) {
        let [index, todo] = _todos.findEntry(todo => todo.id == id);
        _updateTodos(_todos.set(index, todo.set("complete", !todo.complete)));
      }, 
      onToggleCompleteAll: function(checked) {
        _updateTodos(_todos.map(todo => todo.set("complete", checked)));
      },
      onDestroy: function(id) {
        let [index, todo] = _todos.findEntry(todo => todo.id == id);
        _updateTodos(_todos.delete(index));
      },
      onDestroyCompleted: function() {
        _updateTodos(_todos.filter(todo => !todo.complete));
      },
      initialize: function() {
        return PersistStore.initialize()
          .then(todos => {
             _todos = todos;
             return todos;
          });
      }
    });

    let _updateTodos = function(todos) {
      _todos = todos;
      todoStore.trigger(_todos);
      PersistStore.update(todos);
    };

    return todoStore;
  };

  angular
    .module('app')
    .service('TodoStore', ['TodoActions', 'PersistStore', TodoStore]);
})();
