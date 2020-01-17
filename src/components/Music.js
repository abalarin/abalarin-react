import axios from 'axios';
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
	card: {
		display: 'flex',
		marginBottom: 15,
		maxWidth: 400,
	},
	content: {
		flex: '1 0 auto',
		textAlign: 'left',
	},
	cover: {
		width: 151,
		height: 130,
	},
}));

function timeSince(zulu_date) {
	var date = Date.parse(zulu_date);

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes";
	}
	return Math.floor(seconds) + " seconds";
}

function MediaControlCard(props) {
		const classes = useStyles();

		if(props.music){
				return (
						<div>
						{props.music.map(song => (
								<Card key={song.id} className={classes.card}>
								<CardMedia
										className={classes.cover}
										image={song.album_cover.url}
										title="Live from space album cover"
								/>
								<div className={classes.details}>
										<CardContent className={classes.content}>
										<Typography component="h5" variant="h5">
												{song.name}
										</Typography>
										<Typography variant="subtitle1" color="textSecondary">
												{song.artist}
										</Typography>
										<Typography variant="caption" color="textSecondary">
												Played {timeSince(song.played_at)} Ago
										</Typography>
										</CardContent>
								</div>
								</Card>
						))}
						</div>
				);
		}
		else{
				return(
						<div>
						Loading...
						</div>
				)
		}
}

class Music extends React.Component {
	state = {
		music: [],
		count: this.props.count
	}

	componentDidMount() {
		axios.get('http://127.0.0.1:5000/music/' + this.state.count)
			.then(res => {
				const music = []
				for (var key in res.data.items) {
					if (res.data.items.hasOwnProperty(key)) {
						let song_name = res.data.items[key].track.name;
						if(song_name.length > 14)
							song_name = song_name.substring(0,15) + "..."; 

						let artist_name = res.data.items[key].track.artists[0].name;
						if(artist_name.length > 24)
							artist_name = artist_name.substring(0,25) + "..."; 

						music.push({
							"id": key,
							"played_at": res.data.items[key].played_at,
							"album_cover" : res.data.items[key].track.album.images[0],
							"name": song_name,
							"artist": artist_name
						})
					}
				}
				this.setState({ music });
			})
	}

	render(){
		return (
			<div>
				<Typography component="h2" variant="h2" style={{fontFamily: 'Lato', fontSize: 'calc(25px + 2vmin)', marginBottom: '30px'}}>
					Music
				</Typography>
				<MediaControlCard music={this.state.music}/>
			</div>
		)
	}

}
	
export default Music