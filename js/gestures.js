import _ from 'lodash'
import Hammer from 'hammerjs'


document.addEventListener('DOMContentLoaded', e => {
	const mc = new Hammer (document.getElementById('scene'), {
		direction: Hammer.DIRECTION_ALL
	})

	mc.on('tap press', function(e) {
		console.log(e.type +' gesture detected.')
	});
});
