// Una estructura simple para almacenar canciones con características
class Song {
    constructor(title, tempo, pitch, duration) {
        this.title = title;
        this.tempo = tempo;
        this.pitch = pitch;
        this.duration = duration;
    }
}

// Calcula la distancia entre dos canciones
function distance(song1, song2) {
    const tempoDiff = song1.tempo - song2.tempo;
    const pitchDiff = song1.pitch - song2.pitch;
    const durationDiff = song1.duration - song2.duration;
    return Math.sqrt(tempoDiff**2 + pitchDiff**2 + durationDiff**2);
}

// Función para cargar canciones
function loadSongs() {
    const files = document.getElementById('file-input').files;
    if (files.length === 0) return;

    const songs = [];
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = '';

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(event.target.result, function(buffer) {
                const meydaAnalyzer = Meyda.createMeydaAnalyzer({
                    audioContext: audioContext,
                    source: audioContext.createBufferSource(),
                    bufferSize: 512,
                    featureExtractors: ['rms', 'zcr', 'spectralCentroid', 'spectralRolloff'],
                    callback: features => {
                        const tempo = features.rms;
                        const pitch = features.spectralCentroid;
                        const duration = buffer.duration;

                        const song = new Song(file.name, tempo, pitch, duration);
                        songs.push(song);

                        const songDiv = document.createElement('div');
                        songDiv.textContent = `${file.name} (Tempo: ${tempo.toFixed(2)}, Pitch: ${pitch.toFixed(2)}, Duración: ${duration.toFixed(2)}s)`;
                        playlistDiv.appendChild(songDiv);

                        if (songs.length === files.length) {
                            const targetSong = songs[0]; // Usa la primera canción cargada como objetivo
                            const distances = songs.slice(1).map(song => {
                                return {
                                    song: song,
                                    distance: distance(targetSong, song)
                                };
                            });

                            distances.sort((a, b) => b.distance - a.distance);

                            const recommendationsDiv = document.getElementById('recommendations');
                            recommendationsDiv.innerHTML = '';
                            distances.forEach(recommendation => {
                                const recSongDiv = document.createElement('div');
                                recSongDiv.textContent = `${recommendation.song.title} (Distancia: ${recommendation.distance.toFixed(2)})`;
                                recommendationsDiv.appendChild(recSongDiv);
                            });
                        }
                    }
                });

                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                meydaAnalyzer.setSource(source);
                source.start(0);
            });
        };
        reader.readAsArrayBuffer(file);
    });
}
