var h = React.createElement;
var Repo =  React.createClass({
  handleClick: function() {
    window.location = this.props.repoinfo.html_url;
  },
  render: function(){
    var info = this.props.repoinfo;
    var org = undefined;
    /*
    if (info.owner.type == "Organization"){
      org = h('a', {href:info.owner.html_url}, info.owner.login)
    }
    */


    var description = info.description;
    var maxLength = 70;
    if (description != null && description.length > maxLength) {
      description = description.slice(0, maxLength) + "......"
    }

    return (
      h('div', {className:"mui-col-md-4 repo-card"}, 
        h('div', {className:"mui-panel", onClick:this.handleClick}, 
          h('a', {href: info.html_url}, 
            h('h3', null, info.name)
          ),
          h('p', null, 
            h('a', {href:info.owner.html_url}, info.owner.login)
          ),
          h('p', {className:"description"}, description),
          h('p', null, 
            h('a', {href: info.html_url + "/issues"}, "Issues"),
            h('span', null,  " | "),
            h('a', {href: info.html_url + "/pulls"}, "PRs"),
            h('span', null,  " | "),
            h('span', {className:"pushed_time"}, info.pushed_at)
          )
        )
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
      h('div', {className:"mui-row"}, lis)
    )
  }
})

var Dashboard =  React.createClass({
  getInitialState: function() {
    return {repos: [{name:"Loading...", owner:{}, description:''}]}
  },
  componentDidMount: function() {

    var re = /\?user=([\w-]*)/g; 
    var matches = re.exec(location.search);
    var username = null;
    if (matches !== null && matches.length == 2) {
      username = matches[1];
    }
    else {
      username = prompt("What's your GitHub username?")
      window.location += ("?user=" + username);
    }

    /*var username = "shinglyu"*/
    var repoParams = '?type=all&per_page=100&sort=pushed&direction=desc'
    /* Get user owned repos */
    /*
    fetch('https://api.github.com/users/' + username + '/repos' + repoParams)
      .then(function(result){
          return result.json();
      })
    */

    var expireTime = 12 * 60 * 60 * 1000; // 12 hour
    cachedFetch('https://api.github.com/users/' + username + '/repos' + repoParams, expireTime)
      .then(function(resultjson){
          this.setState({repos: resultjson});
      }.bind(this))

    /* Get org repos in which the user is*/
    /*
    fetch('https://api.github.com/users/' + username + '/orgs')
      .then(function(result){
          return result.json();
      })
    */
    cachedFetch('https://api.github.com/users/' + username + '/orgs', expireTime)
      .then(function(resultjson){
        for (var idx in resultjson){
          var org = resultjson[idx]
          /*
          fetch(org.repos_url + repoParams)
            .then(function(repos){
              return repos.json();
            })
          */
          cachedFetch(org.repos_url + repoParams, expireTime)
            .then(function(reposjson){
              function compareByPushedTimeRev(x,y){
                if (x.pushed_at > y.pushed_at){ return -1; }
                else if (x.pushed_at < y.pushed_at){ return 1; }
                else { return 0; }
              }
              var repos = this.state.repos.concat(reposjson).sort(compareByPushedTimeRev);
              this.setState({repos: repos})
            }.bind(this))
        }
      }.bind(this))
  },
  render: function(){
    return (
      h('div', {className:"mui-row"}, 
        h('h1', {className:"mui-col-md-12"}, 'My GitHub'),
        h(RepoList, {repos:this.state.repos})
       )
    )
  }
})
ReactDOM.render(React.createElement(Dashboard), document.getElementById('content'))
