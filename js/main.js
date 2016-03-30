var h = React.createElement;
var Repo =  React.createClass({
  render: function(){
    var info = this.props.repoinfo;
    return (
      h('div', null, 
        h('a', {href: info.html_url}, 
          h('h3', null, info.name)
        ),
        h('p', null, info.description)
       )
    )
  }
})
var RepoList =  React.createClass({
  render: function(){
    var lis = this.props.repos.map(function(repoinfo, idx){
      return h(Repo, { key:idx, repoinfo: repoinfo} )
    })
    return (
      h('div', null, lis)
    )
  }
})

var Dashboard =  React.createClass({
  getInitialState: function() {
    return {repos: [{title:"Loading..."}]}
  },
  componentDidMount: function() {
    username="shinglyu"
    fetch('https://api.github.com/users/' + username + '/repos').then(
      function(result){
        result.json().then(function(resultjson){
          this.setState({repos: resultjson});

        }.bind(this))
      }.bind(this)
    )
    //TODO: find org repos too
  },
  render: function(){
    return (
      h('div', null, 
        h('h1', null, 'My GitHub'),
        h(RepoList, {repos:this.state.repos})
       )
    )
  }
})
ReactDOM.render(React.createElement(Dashboard), document.getElementById('content'))
