var h = React.createElement;
var Repo =  React.createClass({
  render: function(){
    var info = this.props.repoinfo;
    return (
      h('div', null, 
        h('a', {href: info.html_url}, 
          h('h3', null, info.name)
        ),
        h('p', null, info.description),
        h('p', null, info.updated_at)
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
    var username = "shinglyu"
    var repoParams = '?type=all&per_page=100&sort=updated&direction=desc'
    /* Get user owned repos */
    fetch('https://api.github.com/users/' + username + '/repos' + repoParams)
      .then(function(result){
          return result.json();
      })
      .then(function(resultjson){
          this.setState({repos: resultjson});
      }.bind(this))

    /* Get org repos in which the user is*/
    fetch('https://api.github.com/users/' + username + '/repos' + repoParams)
    fetch('https://api.github.com/users/' + username + '/orgs')
      .then(function(result){
          return result.json();
      })
      .then(function(resultjson){
        for (var idx in resultjson){
          var org = resultjson[idx]
          fetch(org.repos_url + repoParams)
            .then(function(repos){
              return repos.json();
            })
            .then(function(reposjson){
              function compareByUpdatedTimeRev(x,y){
                if (x.updated_at > y.updated_at){ return -1; }
                else if (x.updated_at < y.updated_at){ return 1; }
                else { return 0; }
              }
              var repos = this.state.repos.concat(reposjson).sort(compareByUpdatedTimeRev);
              this.setState({repos: repos})
            }.bind(this))
        }
      }.bind(this))
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
