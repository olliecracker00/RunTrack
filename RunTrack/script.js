document.getElementById('run-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const distance = parseFloat(document.getElementById('distance').value);
    const time = parseFloat(document.getElementById('time').value);
    const heartrate = document.getElementById('heartrate').value ? parseInt(document.getElementById('heartrate').value) : null;

    if (isNaN(distance) || isNaN(time) || distance <= 0 || time <= 0) {
        alert('Per favore inserisci dati validi.');
        return;
    }

    // Calcoli
    const paceMinPerKm = time / distance;
    const paceMinutes = Math.floor(paceMinPerKm);
    let paceSeconds = Math.round((paceMinPerKm - paceMinutes) * 60);
    let adjustedMinutes = paceMinutes;

    if (paceSeconds === 60) {
      adjustedMinutes += 1;
      paceSeconds = 0;
    }
    const formattedPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} min/km`;
    
    const speedKmH = (distance / (time / 60)).toFixed(2);

    // Aggiorna UI
    document.getElementById('pace-result').textContent = formattedPace;
    document.getElementById('speed-result').textContent = `${speedKmH} km/h`;

    // Consigli e Confronto
    const results = analyzePerformance(paceMinPerKm, heartrate);
    document.getElementById('advice-text').textContent = results.advice;
    
    const comparisonPercentile = calculateComparison(paceMinPerKm, distance);
    document.getElementById('comparison-text').textContent = `Sei più veloce del ${comparisonPercentile}% dei runner mondiali.`;
    
    // Calcolo obiettivo top 20% (percentile 80)
    const mean = getMeanByDistance(distance);
    const scale = 0.8;
    const targetPercentile = 80;
    const upgradeContainer = document.querySelector('.upgrade-container');
    
    // Debug per console
    console.log("Percentile calcolato:", comparisonPercentile);
    
    if (comparisonPercentile < targetPercentile) {
        const targetPaceRaw = mean + scale * Math.log((100 / targetPercentile) - 1);
        const targetMin = Math.floor(targetPaceRaw);
        const targetSec = Math.round((targetPaceRaw - targetMin) * 60);
        const formattedTargetPace = `${targetMin}:${targetSec.toString().padStart(2, '0')}`;
        document.getElementById('target-text').innerHTML = `🎯 Per entrare nel <strong>top 20%</strong> ti serve un passo di <strong>${formattedTargetPace} min/km</strong>.`;
        
        // Aggiorna link dinamico per improve.html
        const currentPaceFormatted = paceMinPerKm.toFixed(2);
        const targetPaceFormatted = targetPaceRaw.toFixed(2);
        const upgradeLink = document.getElementById('upgrade-link');
        upgradeLink.href = `improve.html?distance=${distance}&current=${currentPaceFormatted}&target=${targetPaceFormatted}&percentile=${comparisonPercentile}`;
        
        // Mostra il contenitore
        upgradeContainer.style.display = 'block';
    } else {
        document.getElementById('target-text').innerHTML = `🏆 Sei già nell'élite dei runner! Continua così per mantenere la tua posizione.`;
        
        // Nascondi il contenitore forzando lo stile display
        upgradeContainer.style.display = 'none';
    }
    
    const bar = document.getElementById('comparison-bar');
    bar.style.width = '0%';
    setTimeout(() => {
        bar.style.width = `${comparisonPercentile}%`;
    }, 100);

    // Mostra risultati
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});

function setDistance(km) {
    document.getElementById('distance').value = km;
}

function getMeanByDistance(distance) {
    // La media del passo (min/km) aumenta con la distanza
    if (distance <= 5) return 5.75;      // ~5:45 min/km per i 5km
    if (distance <= 10) return 6.0;     // ~6:00 min/km per i 10km
    if (distance <= 21.1) return 6.3;   // ~6:18 min/km per la mezza maratona
    return 6.6;                         // ~6:36 min/km per la maratona e oltre
}

function calculateComparison(pace, distance) {
    // Calcolo del percentile utilizzando una funzione logistica per una stima più realistica.
    // La media statistica ora varia in base alla distanza percorsa.
    const mean = getMeanByDistance(distance);
    const scale = 0.8;

    const percentile = 100 / (1 + Math.exp((pace - mean) / scale));

    return Math.round(percentile);
}

function analyzePerformance(pace, hr) {
    let advice = "";
    
    if (pace < 4) {
        advice = "Wow, sei un fulmine! A questo ritmo, assicurati di curare bene il recupero e l'idratazione. Potresti puntare a gare competitive.";
    } else if (pace < 5) {
        advice = "Ottimo passo! Sei un runner avanzato. Per migliorare ancora, prova a inserire delle sessioni di ripetute o interval training.";
    } else if (pace < 6) {
        advice = "Buon ritmo costante. Sei nella media dei runner regolari. Per progredire, cerca di aumentare gradualmente il chilometraggio settimanale.";
    } else {
        advice = "Ottimo inizio! La costanza è la chiave. Non preoccuparti troppo della velocità ora, concentrati sul finire i tuoi km in totale comfort.";
    }

    if (hr && hr > 170 && pace > 6) {
        advice += " Nota: i tuoi battiti sembrano alti per questo ritmo, prova a rallentare un po' per costruire la base aerobica.";
    }

    return { advice };
}
