import React from 'react';
import Mustache from 'mustache';

import '../styles/github.css'

import Typography from '@material-ui/core/Typography';

var GitHubActivity = (function() {
		var obj = {};

		var methods = {
				renderLink: function(url, title, cssClass) {
				if (!title) { title = url; }
				if (typeof(cssClass) === 'undefined') cssClass = "";
				return Mustache.render('<a class="' + cssClass + '" href="{{url}}" target="_blank">{{{title}}}</a>', { url: url, title: title });
				},
				renderGitHubLink: function(url, title, cssClass) {
				if (!title) { title = url; }
				if (typeof(cssClass) === 'undefined') cssClass = "";
				return methods.renderLink('https://github.com/' + url, title, cssClass);
				},
				getMessageFor: function(data) {
				var p = data.payload;
				data.repoLink = methods.renderGitHubLink(data.repo.name);
				data.userGravatar = Mustache.render('<div class="gha-gravatar-user"><img src="{{url}}" class="gha-gravatar-small"></div>', { url: data.actor.avatar_url });

				// Get the branch name if it exists.
				if (p.ref) {
						if (p.ref.substring(0, 11) === 'refs/heads/') {
						data.branch = p.ref.substring(11);
						} else {
						data.branch = p.ref;
						}
						data.branchLink = methods.renderGitHubLink(data.repo.name + '/tree/' + data.branch, data.branch) + ' at ';
				}

				// Only show the first 6 characters of the SHA of each commit if given.
				if (p.commits) {
						var shaDiff = p.before + '...' + p.head;
						var length = p.commits.length;
						if (length === 2) {
						// If there are 2 commits, show message 'View comparison for these 2 commits >>'
						data.commitsMessage = Mustache.render('<a href="https://github.com/{{repo}}/compare/{{shaDiff}}">View comparison for these 2 commits &raquo;</a>', { repo: data.repo.name, shaDiff: shaDiff });
						} else if (length > 2) {
						// If there are more than two, show message '(numberOfCommits - 2) more commits >>'
						data.commitsMessage = Mustache.render('<a href="https://github.com/{{repo}}/compare/{{shaDiff}}">{{length}} more ' + pluralize('commit', length - 2) + ' &raquo;</a>', { repo: data.repo.name, shaDiff: shaDiff, length: p.size - 2 });
						}

						p.commits.forEach(function(d, i) {
						if (d.message.length > 66) {
								d.message = d.message.substring(0, 66) + '...';
						}
						if (i < 2) {
								d.shaLink = methods.renderGitHubLink(data.repo.name + '/commit/' + d.sha, d.sha.substring(0, 6), 'gha-sha');
								d.committerGravatar = Mustache.render('<img class="gha-gravatar-commit" src="https://avatars0.githubusercontent.com/u/7669934?s=60&v=4" width="16" />');
						} else {
								// Delete the rest of the commits after the first 2, and then break out of the each loop.
								p.commits.splice(2, p.size);
								return false;
						}
						});
				}

				// Get the link if this is an IssueEvent.
				if (p.issue) {
						var title = data.repo.name + "#" + p.issue.number;
						data.issueLink = methods.renderLink(p.issue.html_url, title);
						data.issueType = "issue";
						if (p.issue.pull_request) {
						data.issueType = "pull request";
						}
				}

				// Retrieve the pull request link if this is a PullRequestEvent.
				if (p.pull_request) {
						var pr = p.pull_request;
						data.pullRequestLink = methods.renderLink(pr.html_url, data.repo.name + "#" + pr.number);
						data.mergeMessage = "";

						// If this was a merge, set the merge message.
						if (p.pull_request.merged) {
						p.action = "merged";
						var message = '{{c}} ' + pluralize('commit', pr.commits) + ' with {{a}} ' + pluralize('addition', pr.additions) + ' and {{d}} ' + pluralize('deletion', pr.deletions);
						data.mergeMessage = Mustache.render('<br><small class="gha-message-merge">' + message + '</small>', { c: pr.commits, a: pr.additions, d: pr.deletions });
						}
				}

				// Get the link if this is a PullRequestReviewCommentEvent
				if (p.comment && p.comment.pull_request_url) {
						title = data.repo.name + "#" + p.comment.pull_request_url.split('/').pop();
						data.pullRequestLink = methods.renderLink(p.comment.html_url, title);
				}

				// Get the comment if one exists, and trim it to 150 characters.
				if (p.comment && p.comment.body) {
						data.comment = p.comment.body;
						if (data.comment.length > 150) {
						data.comment = data.comment.substring(0, 150) + '...';
						}
						if (p.comment.html_url && p.comment.commit_id) {
						title = data.repo.name + '@' + p.comment.commit_id.substring(0, 10);
						data.commentLink = methods.renderLink(p.comment.html_url, title);
						}
				}

				if (data.type === 'ReleaseEvent') {
						data.tagLink = methods.renderLink(p.release.html_url, p.release.tag_name);
						data.zipLink = methods.renderLink(p.release.zipball_url, 'Download Source Code (zip)');
				}

				// Wiki event
				if (data.type === 'GollumEvent') {
						var page = p.pages[0];
						data.actionType = page.action;
						data.message = data.actionType.charAt(0).toUpperCase() + data.actionType.slice(1) + ' ';
						data.message += methods.renderGitHubLink(page.html_url, page.title);
				}

				if (data.type === 'FollowEvent') data.targetLink = methods.renderGitHubLink(p.target.login);
				if (data.type === 'ForkEvent')   data.forkLink   = methods.renderGitHubLink(p.forkee.full_name);
				if (data.type === 'MemberEvent') data.memberLink = methods.renderGitHubLink(p.member.login);

				if (p.gist) {
						data.actionType = p.action === 'fork' ? p.action + 'ed' : p.action + 'd';
						data.gistLink = methods.renderLink(p.gist.html_url, 'gist: ' + p.gist.id);
				}

				message = Mustache.render(templates[data.type], data);
				var timeString = millisecondsToStr(new Date() - new Date(data.created_at));
				var icon;

				if (data.type === 'CreateEvent' && (['repository', 'branch', 'tag'].indexOf(p.ref_type) >= 0)) {
						// Display separate icons depending on type of create event.
						icon = icons[data.type + '_' + p.ref_type];
				} else {
						icon = icons[data.type]
				}
				var activity = { message: message, icon: icon, timeString: timeString, userLink: methods.renderGitHubLink(data.actor.login) };

				if (singleLineActivities.indexOf(data.type) > -1) {
						return Mustache.render(templates.SingleLineActivity, activity);
				}
				return Mustache.render(templates.Activity, activity);
				},
				getHeaderHTML: function(data) {
				if (data.name) {
						data.userNameLink = methods.renderLink(data.html_url, data.name);
				} else {
						data.withoutName = ' without-name';
				}
				data.userLink = methods.renderLink(data.html_url, data.login);
				data.gravatarLink = methods.renderLink(data.html_url, '<img src="' + data.avatar_url + '">');

				return Mustache.render(templates.UserHeader, data);
				},
				getActivityHTML: function(data, limit) {
				var text = '';
				var dataLength = data.length;
				if (limit && limit > dataLength) {
						limit = dataLength;
				}
				limit = limit ? limit : dataLength;

				if (limit === 0) {
						return Mustache.render(templates.NoActivity, {});
				}
				for (var i = 0; i < limit; i++) {
						text += methods.getMessageFor(data[i]);
				}

				return text;
				},
				getOutputFromRequest: function(url, callback) {
				var request = new XMLHttpRequest();
				request.open('GET', url);
				request.setRequestHeader('Accept', 'application/vnd.github.v3+json');

				request.onreadystatechange = function() {
						if (request.readyState === 4) {
						if (request.status >= 200 && request.status < 300){
								var data = JSON.parse(request.responseText);
								callback(undefined, data);
						} else {
								callback('request for ' + url + ' yielded status ' + request.status);
						}
						}
				};

				request.onerror = function() { callback('An error occurred connecting to ' + url); };
				request.send();
				},
				renderStream: function(output, div) {
				div.innerHTML = Mustache.render(templates.Stream, { text: output });
				div.style.position = 'relative';
				},
				writeOutput: function(selector, content) {
				var div = selector.charAt(0) === '#' ? document.getElementById(selector.substring(1)) : document.getElementsByClassName(selector.substring(1));
				if (div instanceof HTMLCollection) {
						for (var i = 0; i < div.length; i++) {
						methods.renderStream(content, div[i]);
						}
				} else {
						methods.renderStream(content, div);
				}
				},
				renderIfReady: function(selector, header, activity) {
				if (header && activity) {
						methods.writeOutput(selector, header + activity);
				}
				}
		};

		obj.feed = function(options) {
				if (!options.username || !options.selector) {
					// throw "You must specify the username and selector options for the activity stream.";
					return { hasError: true };
				}

				var selector = options.selector,
						userUrl   = 'https://api.github.com/users/' + options.username,
						eventsUrl = userUrl + '/events',
						header,
						activity;

				if (!!options.repository){
					eventsUrl = 'https://api.github.com/repos/' + options.username + '/' + options.repository + '/events';
				}
				
				let config = require('../config.json');
				if (config.GITHUB_TOKEN) {
					userUrl += '?access_token=' + config.GITHUB_TOKEN;
					eventsUrl += '?access_token=' + config.GITHUB_TOKEN;
				}

				if (options.clientId && options.clientSecret) {
				var authString = '?client_id=' + options.clientId + '&client_secret=' + options.clientSecret;
				userUrl   += authString;
				eventsUrl += authString;
				}

				if (!!options.eventsUrl){
				eventsUrl = options.eventsUrl;
				}

				// Allow templates override
				if (typeof options.templates == 'object') {
				for (var template in templates) {
						if (typeof options.templates[template] == 'string') {
						templates[template] = options.templates[template];
						}
				}
				}

				methods.getOutputFromRequest(userUrl, function(error, output) {
				if (error) {
						header = Mustache.render(templates.UserNotFound, { username: options.username });
				} else {
						header = methods.getHeaderHTML(output)
				}
				methods.renderIfReady(selector, header, activity)
				});

				methods.getOutputFromRequest(eventsUrl, function(error, output) {
				if (error) {
						activity = Mustache.render(templates.EventsNotFound, { username: options.username });
				} else {
						var limit = options.limit !== 'undefined' ? parseInt(options.limit, 10) : null;
						activity = methods.getActivityHTML(output, limit);
				}
				methods.renderIfReady(selector, header, activity);
				});
		};

		return obj;
}());
	
// Takes in milliseconds and converts it to a human readable time,
// such as 'about 3 hours ago' or '23 days ago'
function millisecondsToStr(milliseconds) {

	function numberEnding(number) {
			return (number > 1) ? 's ago' : ' ago';
	}
	var temp = Math.floor(milliseconds / 1000);

	var years = Math.floor(temp / 31536000);
	if (years) return years + ' year' + numberEnding(years);

	var months = Math.floor((temp %= 31536000) / 2592000);
	if (months) return months + ' month' + numberEnding(months);

	var days = Math.floor((temp %= 2592000) / 86400);
	if (days) return days + ' day' + numberEnding(days);

	var hours = Math.floor((temp %= 86400) / 3600);
	if (hours) return 'about ' + hours + ' hour' + numberEnding(hours);

	var minutes = Math.floor((temp %= 3600) / 60);
	if (minutes) return minutes + ' minute' + numberEnding(minutes);

	var seconds = temp % 60;
	if (seconds) return seconds + ' second' + numberEnding(seconds);

	return 'just now';
}

// Pluralizes a word, but only works when the word requires
// an 's' to be added for pluralization.
function pluralize(word, number) {
// Yeah I know, this sucks.
if (number !== 1) return word + 's';
return word;
}

var templates = {
	Stream: '<div class="gha-feed">{{{text}}}<div class="gha-push-small"></div>{{{footer}}}</div>',
		// eslint-disable-next-line
		Activity: '<div id="{{id}}" class="gha-activity">\
										<div class="gha-activity-icon"><span class="octicon octicon-{{icon}}"></span></div>\
										<div class="gha-message"><div class="gha-time">{{{timeString}}}</div>{{{userLink}}} {{{message}}}</div>\
										<div class="gha-clear"></div>\
								</div>',
		// eslint-disable-next-line
		SingleLineActivity: '<div class="gha-activity gha-small">\
														<div class="gha-activity-icon"><span class="octicon octicon-{{icon}}"></span></div>\
														<div class="gha-message"><div class="gha-time">{{{timeString}}}</div>{{{userLink}}} {{{message}}}</div>\
														<div class="gha-clear"></div>\
														</div>',
		// eslint-disable-next-line
		UserHeader: '<div class="gha-header">\
										<div class="gha-github-icon"><span class="octicon octicon-mark-github"></span></div>\
										<div class="gha-user-info{{withoutName}}">{{{userNameLink}}}<p>{{{userLink}}}</p></div>\
										<div class="gha-gravatar">{{{gravatarLink}}}</div>\
										</div><div class="gha-push"></div>',
		Footer: '<div class="gha-footer">Public Activity <a href="https://github.com/caseyscarborough/github-activity" target="_blank">GitHub Activity Stream</a>',
		NoActivity: '<div class="gha-info">This user does not have any public activity yet.</div>',
		UserNotFound: '<div class="gha-info">User {{username}} wasn\'t found.</div>',
		EventsNotFound: '<div class="gha-info">Events for user {{username}} not found.</div>',
		CommitCommentEvent: 'commented on commit {{{commentLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
		CreateEvent: 'created {{payload.ref_type}} {{{branchLink}}}{{{repoLink}}}',
		DeleteEvent: 'deleted {{payload.ref_type}} {{payload.ref}} at {{{repoLink}}}',
		FollowEvent: 'started following {{{targetLink}}}',
		ForkEvent: 'forked {{{repoLink}}} to {{{forkLink}}}',
		GistEvent: '{{actionType}} {{{gistLink}}}',
		GollumEvent: '{{actionType}} the {{{repoLink}}} wiki<br>{{{userGravatar}}}<small>{{{message}}}</small>',
		IssueCommentEvent: 'commented on {{issueType}} {{{issueLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
		IssuesEvent: '{{payload.action}} issue {{{issueLink}}}<br>{{{userGravatar}}}<small>{{payload.issue.title}}</small>',
		MemberEvent: 'added {{{memberLink}}} to {{{repoLink}}}',
		PublicEvent: 'open sourced {{{repoLink}}}',
		PullRequestEvent: '{{payload.action}} pull request {{{pullRequestLink}}}<br>{{{userGravatar}}}<small>{{payload.pull_request.title}}</small>{{{mergeMessage}}}',
		PullRequestReviewCommentEvent: 'commented on pull request {{{pullRequestLink}}}<br>{{{userGravatar}}}<small>{{comment}}</small>',
		// eslint-disable-next-line
		PushEvent: 'pushed to {{{branchLink}}}{{{repoLink}}}<br>\
										<ul class="gha-commits">{{#payload.commits}}<li><small>{{{committerGravatar}}} {{{shaLink}}} {{message}}</small></li>{{/payload.commits}}</ul>\
										<small class="gha-message-commits">{{{commitsMessage}}}</small>',
		ReleaseEvent: 'released {{{tagLink}}} at {{{repoLink}}}<br>{{{userGravatar}}}<small><span class="octicon octicon-cloud-download"></span>  {{{zipLink}}}</small>',
		WatchEvent: 'starred {{{repoLink}}}'
},

icons = {
		CommitCommentEvent: 'comment-discussion',
		CreateEvent_repository: 'repo-create',
		CreateEvent_tag: 'tag-add',
		CreateEvent_branch: 'git-branch-create',
		DeleteEvent: 'repo-delete',
		FollowEvent: 'person-follow',
		ForkEvent: 'repo-forked',
		GistEvent: 'gist',
		GollumEvent: 'repo',
		IssuesEvent: 'issue-opened',
		IssueCommentEvent: 'comment-discussion',
		MemberEvent: 'person',
		PublicEvent: 'globe',
		PullRequestEvent: 'git-pull-request',
		PullRequestReviewCommentEvent: 'comment-discussion',
		PushEvent: 'git-commit',
		ReleaseEvent: 'tag-add',
		WatchEvent: 'star'
},

singleLineActivities = [ 'CreateEvent', 'DeleteEvent', 'FollowEvent', 'ForkEvent', 'GistEvent', 'MemberEvent', 'WatchEvent' ];

class Github extends React.Component {
	
		state = {
				feed: [],
				count: this.props.count
		}
	
		componentDidMount() {
				GitHubActivity.feed({
						username: "abalarin",
						selector: "#feed",
						limit: this.state.count // optional
				});
		}
	
		render(){
			return (
				<div className="github_feed">
						<Typography component="h2" variant="h2" style={{fontFamily: 'Lato', fontSize: 'calc(25px + 2vmin)', marginBottom: '30px', textAlign: 'center'}}>
								Github
						</Typography>
						<div id="feed"></div>
				</div>
			)
		}
	
	}
	
	export default Github
	