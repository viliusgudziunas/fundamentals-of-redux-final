import * as chai from 'https://cdn.skypack.dev/chai@latest';
import deepFreeze from 'https://cdn.skypack.dev/deep-freeze@latest';

// ======================================
// Reducers
// ======================================
const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false,
            };
        case 'TOGGLE_TODO':
            if (state.id !== action.id) return state;
            return {
                ...state,
                completed: !state.completed,
            };
        default:
            return state;
    }
};

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state, todo(undefined, action)];
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action));
        default:
            return state;
    }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
};

const combineReducers = reducers => {
    return (state = {}, action) => {
        return Object.keys(reducers).reduce((nextState, key) => {
            nextState[key] = reducers[key](state[key], action);
            return nextState;
        }, {});
    };
};

const todoApp = combineReducers({ todos, visibilityFilter });

// ======================================
// ActionCreators
// ======================================
const { Component } = React;
const { connect } = ReactRedux;

let nextTodoId = 0;
const addTodo = text => {
    const type = 'ADD_TODO';
    return { type, text, id: nextTodoId++ };
};

const setVisibilityFilter = filter => {
    const type = 'SET_VISIBILITY_FILTER';
    return { type, filter };
};

const toggleTodo = id => {
    const type = 'TOGGLE_TODO';
    return { type, id };
};

// ======================================
// AddTodo
// ======================================

let AddTodo = ({ dispatch }) => {
    let input;

    return (
        <div>
            <input ref={node => (input = node)} />
            <button
                onClick={() => {
                    dispatch(addTodo(input.value));
                    input.value = '';
                }}
            >
                Add Todo
            </button>
        </div>
    );
};
AddTodo = connect()(AddTodo);

// ======================================
// VisibleTodoList
// ======================================
const Todo = ({ onClick, completed, text }) => (
    <li
        onClick={onClick}
        style={{
            textDecoration: completed ? 'line-through' : 'none',
        }}
    >
        {text}
    </li>
);

const TodoList = ({ todos, onTodoClick }) => (
    <ul>
        {todos.map(todo => (
            <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
        ))}
    </ul>
);

const getVisibleTodos = (todos, filter) => {
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(todo => todo.completed);
        case 'SHOW_ACTIVE':
            return todos.filter(todo => !todo.completed);
        default:
            return todos;
    }
};

const mapStateToTodoListProps = ({ todos, visibilityFilter }) => {
    return {
        todos: getVisibleTodos(todos, visibilityFilter),
    };
};
const mapDispatchToTodoListProps = dispatch => {
    return {
        onTodoClick: id => dispatch(toggleTodo(id)),
    };
};
const VisibleTodoList = connect(mapStateToTodoListProps, mapDispatchToTodoListProps)(TodoList);

// ======================================
// Footer
// ======================================

const Link = ({ active, onClick, children }) => {
    if (active) {
        return <span>{children}</span>;
    }

    return (
        <a
            href='#'
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
        >
            {children}
        </a>
    );
};

const mapStateToLinkProps = (state, ownProps) => {
    return {
        active: ownProps.filter === state.visibilityFilter,
    };
};
const mapDispatchToLinkProps = (dispatch, ownProps) => {
    return {
        onClick: () => dispatch(setVisibilityFilter(ownProps.filter)),
    };
};
const FilterLink = connect(mapStateToLinkProps, mapDispatchToLinkProps)(Link);

const Footer = () => {
    return (
        <p>
            Show: <FilterLink filter='SHOW_ALL'>All</FilterLink>
            {', '}
            <FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>
            {', '}
            <FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
        </p>
    );
};

// ======================================
// TodoApp
// ======================================

const TodoApp = () => (
    <div>
        <AddTodo />
        <VisibleTodoList />
        <Footer />
    </div>
);

const { Provider } = ReactRedux;
const { createStore } = Redux;

ReactDOM.render(
    <Provider store={createStore(todoApp)}>
        <TodoApp />
    </Provider>,
    document.getElementById('root'),
);
