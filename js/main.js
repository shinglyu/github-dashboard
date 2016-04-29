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
    let cardClasses = "mui-col-md-4 repo-card" + (this.props.selected?" selected-card":"")

    return (
      h('div', {className:cardClasses},
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
  openSelection: function(){
    window.location.href = this.props.repos[this.props.selection].html_url
  },
  render: function(){
    let selection = this.props.selection;
    var lis = this.props.repos.map(function(repoinfo, idx){
      return h(Repo, { key:idx, repoinfo: repoinfo, selected:(idx==selection)?true:false} )
    })
    return (
      h('div', {className:"mui-row"}, lis)
    )
  }
})

var Dashboard =  React.createClass({
  getInitialState: function() {
    return {
      repos: [{name:"Loading...", owner:{}, description:''}],
      selection: -1,
    }
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
        this.setState({repoCount: resultjson.length})
        for (var idx in resultjson){
          var org = resultjson[idx]
          fetch(org.repos_url + repoParams)
            .then(function(repos){
              return repos.json();
            })
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
  inputKeyEvent: function(e){
    let max = this.state.repos.length - 1
    let move = function(current,diff){
      if (0 > current){
        return 0; // initial position
      }
      let update = current + diff
      return update < 0? 0 : (update < max? update : max)
    }
    switch (e.which || e.keycode){
      case 72: // h
        this.setState(function(ps,cp){
          return {selection: move(ps.selection,-1)}
        })
        break;
      case 74: // j
        this.setState(function(ps,cp){
          return {selection: move(ps.selection,3)}
        })
        break;
      case 75: // k
        this.setState(function(ps,cp){
          return {selection: move(ps.selection,-3)}
        })
        break;
      case 76: // l
        this.setState(function(ps,cp){
          return {selection: move(ps.selection,1)}
        })
        break;
      case 13: // enter
        // TODO
        this.refs.repolist.openSelection()
        break;
    }
  },
  render: function(){
    return (
      h('div', {className:"mui-row"},
        h('h1', {className:"mui-col-md-12"}, 'My GitHub'),
        h(RepoList, {repos:this.state.repos, selection:this.state.selection, ref:"repolist"})
      )
    )
  }
})

var dashboard = ReactDOM.render(h(Dashboard), document.getElementById('content'))

document.addEventListener("keydown", function(e){
  dashboard.inputKeyEvent(e)
})
