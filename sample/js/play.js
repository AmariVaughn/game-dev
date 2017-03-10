/** Copyright Ivy Tower, LLC **/

var healthbar;
var weapons = [];
var Weapon = {};
var currentWeapon = 0;
var asteroids;
var metal;
var metals;
var collectedMetals = [];
var crystal;
var crystals;
var dust;
var dusts;
var enemies;
var enemiesAlive;
var enemyBullet;
var enemyWeapon;
var scoreText;
var dustBurnt = 0;
var anomaly;
var anomalies;
var comets;

// Player variables
var SHIP_SPEED = 300;
var SHIP_HEALTH = 200;

// Bullet damages (Tier 1)
var SHIP_BASIC_DAM = 10; // Diamond weapon
var SHIP_ROCKT_DAM = 20; // Ruby weapon
var SHIP_CRESC_DAM = 10; // Sunstone weapon w/o burn
var SHIP_ELECT_DAM = 20; // Topaz weapon
var SHIP_LEECH_DAM = 5;  // Emerald weapon
var SHIP_BLAST_DAM = 1;  // Amethyst weapon
var SHIP_FREZE_DAM = 10; // Sapphire weapon
var SHIP_EXPLD_DAM = 10; // Obsidian weapon
var ENEM_BASIC_DAM = 10;
var ENEM_BRUIS_DAM = 30;
var ENEM_CAPTN_DAM = 15; // For each of 3 shots
var ENEM_GOVMT_DAM = 10;

// Crystal weapons
var diamondTier = 0;
var rubyTier = 0;
var sunstoneTier = 0;
var topazTier = 0;
var emeraldTier = 0;
var sapphireTier = 0;
var amethystTier = 0;
var obsidianTier = 0;

// Asteroids variables
var BIG_AST_HEALTH = 30;
var MED_AST_HEALTH = 20;
var SML_AST_HEALTH = 10;
var BIG_AST_SCALE = 0.75;
var MED_AST_SCALE = 0.5;
var SML_AST_SCALE = 0.25;
var BIG_AST_SPEED = 50;
var MED_AST_SPEED = 75;
var SML_AST_SPEED = 100;

// Dust variables
var DUST_COLLECTED = 0;

// Enemy variables
var BASIC_SPEED = 150;
var BASIC_HEALTH = 50;
var BRUISER_SPEED = 100;
var BRUISER_HEALTH = 300;
var CAPTAIN_SPEED = 230;
var CAPTAIN_HEALTH = 150;
var GOVT_SPEED = 150;
var GOVT_HEALTH = 50;
var ESCAPE_POD_SPEED = 400;
var ESCAPE_POD_HEALTH = 25;

// Comet variables
var COMET_HEALTH = 100;
var COMET_SPEED = 250;

// --- PLAYSTATE

var playState = {

    create: function() {

        // --- GAME SETUP

        // Set world bounds
        this.game.world.setBounds(0, 0, 5000, 5000);

        // Simple starry background for now
        this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg');

        // Start music
        this.music = game.add.audio('jupiter');
        this.music.loop = true;
        this.music.play();
        this.moneySound = game.add.audio('money');
        this.deadSound = game.add.audio('dead');

        // Ship Sound Effects
        this.diamondShot = game.add.audio('diamondShot');
        this.diamondShot.volume = 0.3;
        this.engineIdle = game.add.audio('engineIdle');
        this.captainShot = game.add.audio('captainShot');
        this.basicShot = game.add.audio('basicShot');
        this.bruiserShot = game.add.audio('bruiserShot');

        // Add moon for reference point
        this.moon = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'moon');
        this.moon.anchor.setTo(0.5);

        // --- PLAYER SHIP

        // Adds player ship in center
        this.ship = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ship');
        this.ship.anchor.setTo(0.5);
        this.ship.angle = -90; // Points the ship up
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.health = SHIP_HEALTH;

        // Creates ship healthbar
        healthbar = this.game.add.sprite(this.ship.centerX, this.ship.y + 10, 'health');

        // Creates ship shield
        this.shield = this.game.add.sprite(this.ship.centerX, this.ship.y - 10, 'shield');
        this.shield.scale.y = 0.5;
        this.shield.scale.x = 0.0;

        // Collide with world boundaries
        this.ship.body.collideWorldBounds = true;

        // Camera follows ship
        this.game.camera.follow(this.ship);

        // --- PLAYER BULLETS

        weapons.push(new Weapon.Diamond(this.game));
        diamondTier = 1;

        // Create game groups
        asteroids = this.game.add.group();
        comets = this.game.add.group();
        metals = this.game.add.group();
        crystals = this.game.add.group();
        dusts = this.game.add.group();
        anomalies = this.game.add.group();

        // --- ASTEROID SPAWNS

        this.astCount = 0;
        for (var i = 0; i < 50; i++) {
            var astKey = ['bigBlueAst', 'bigRedAst', 'bigGreyAst', 'bigWhiteAst', 'bigBrownAst'][Math.floor(Math.random() * 5)];
            var ast = new playState.Asteroid(this.game, this.game.world.randomX, this.game.world.randomY, astKey, BIG_AST_SCALE, BIG_AST_HEALTH, BIG_AST_SPEED);
            ast.body.bounce.set(0.8);
            asteroids.add(ast);
            this.astCount++;
        }

        // --- ENEMY SPAWNS

        enemiesAlive = 0;

        // Add basic enemies
        enemies = this.game.add.group();
        enemies.enableBody = true;

        for (var i = 0; i < 10; i++) {
            var basic = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'basic', BASIC_SPEED, BASIC_HEALTH, this.ship);
            enemies.add(basic);
            enemiesAlive++;
        }

        // Add bruiser class enemies
        for (var i = 0; i < 5; i++) {
            var bruiser = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'bruiser', BRUISER_SPEED, BRUISER_HEALTH, this.ship);
            enemies.add(bruiser);
            enemiesAlive++;
        }

        // Add captain class enemies
        for (var m = 0; m < 1; m++) {
            var captain = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'captain', CAPTAIN_SPEED, CAPTAIN_HEALTH, this.ship);
            enemies.add(captain);
            enemiesAlive++;
        }

        // Add government enemies
        for (var i = 0; i < 10; i++) {
            var govt = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'govt', GOVT_SPEED, GOVT_HEALTH, this.ship);
            enemies.add(govt);
            enemiesAlive++;
        }

        enemyWeapon = this.add.group();
        enemyWeapon.enableBody = true;

        // --- SCORE
        game.global.score = 0;
        if (DUST_COLLECTED < 210) {
            scoreText = game.add.text(32, 32, 'SCORE: ' + game.global.score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name, {
                fontSize: '32px',
                fill: "#FFF"
            });
        } else {
            scoreText = game.add.text(32, 32, 'SCORE: ' + game.global.score + '   DUST:  INFINITE' + '   WEAPON: ' + weapons[currentWeapon].name, {
                fontSize: '32px',
                fill: "#FFF"
            });
        }
        scoreText.fixedToCamera = true;

        // Spawn an anomaly after 15 seconds
        this.game.time.events.add(Phaser.Timer.SECOND * 15, function(){
            var anomalyKey = ['infinity', 'magnet', 'blackhole', 'transmute', 'drone', 'invisible', 'bomb', 'warp'][Math.floor(Math.random() * 8)];
            anomaly = new this.Anomaly(this.game, this.game.world.width/2, this.game.world.height/2, 'infinity');
            console.log('New anomaly at ' + anomaly.x + ", " + anomaly.y);
            anomalies.add(anomaly);
            anomaly.spawn();
        }, this);

        // Spawn a comet after 15 seconds
        this.game.time.events.add(Phaser.Timer.SECOND * 15, this.newComet, this);

        if (!game.device.desktop){
            this.rotateLabel = game.add.text(game.widows/2, game.height/2, '',
                {font: '30px Arial', fill: '#fff', backgroundColor: '#000'});
            this.rotateLabel.anchor.setTo(.5,.5);

            game.scale.onOrientationChange.add(this.orientationChange, this);


            this.orientationChange();
        }

    },

    update: function() {

        // Update health bar
        this.updateBar(healthbar, this.ship);
        this.updateBar(this.shield, this.ship);

        // --- PLAYER MOVEMENT

        this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship);

        if (this.game.physics.arcade.distanceToPointer(this.ship) > 50) {
            this.game.physics.arcade.moveToPointer(this.ship, SHIP_SPEED);
            this.engineIdle.pause();
        } else {

            this.ship.body.velocity.setTo(0);
        }

        // --- FIRE WEAPON

        // Fires with mouse click
        if (this.game.input.activePointer.isDown && this.ship.alive == true) {
            if (this.game.physics.arcade.distanceToPointer(this.ship) > 50) {
                this.game.physics.arcade.moveToPointer(this.ship, 125);
            }
            weapons[currentWeapon].shoot(this.ship);

        }

        var changeKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        changeKey.onDown.add(this.changeWeapon, this);

        // --- PLAYER BOOST

        var boost = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        if (boost.isDown && DUST_COLLECTED > 0) {

            dustBurnt += 1;
            DUST_COLLECTED -= 1;

            if (dustBurnt >= 6) {

                metal = new this.Metal(this.game, this.ship.previousPosition.x, this.ship.previousPosition.y, 'C');
                metals.add(metal);
                dustBurnt = 0;

            }

            this.shield.scale.x -= .0025;

            if (DUST_COLLECTED == 0) {

                this.shield.scale.x = 0;

            }

            SHIP_SPEED = 600;

        } else {

            if (DUST_COLLECTED > 205){

                SHIP_SPEED = 300;

            } else {

                SHIP_SPEED = 300 - (DUST_COLLECTED / 2);

            }
        }

        if(DUST_COLLECTED > 205){

            scoreText.setText('SCORE: ' + game.global.score + '   DUST: INFINITE' + '   WEAPON: ' + weapons[currentWeapon].name);

        } else {

            scoreText.setText('SCORE: ' + game.global.score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name);

        }
        // --- OBJECT COLLISION

        enemies.forEachAlive(this.bulletCollision, this, weapons);
        asteroids.forEachAlive(this.bulletCollision, this, weapons);
        comets.forEachAlive(this.bulletCollision, this, weapons);
        //this.physics.arcade.overlap(enemyWeapon, this.ship, this.callDamage, null, this); // Comment this out to ignore enemy damage; useful for development

        if (this.ship.alive == true) {

            this.physics.arcade.overlap(this.ship, metals, this.collectMaterial, null, this);
            this.physics.arcade.overlap(this.ship, crystals, this.collectMaterial, null, this);
            this.physics.arcade.overlap(this.ship, dusts, this.collectMaterial, null, this);
            this.physics.arcade.overlap(this.ship, anomalies, this.collectMaterial, null, this);
            this.physics.arcade.overlap(this.ship, anomalies, this.anomalyEffect, null, this);

        }

        this.game.physics.arcade.collide(asteroids, asteroids);

        if(this.ship.health <= 0){

            this.playerDie();
        }

    },

    playerDie: function(){

        this.deadSound.play();

        game.camera.flash(0xffffff, 300);

        game.state.start('menu');

        // Stop music when player dies
        this.music.stop();
        this.diamondShot.pause();
        this.engineIdle.pause();
    },

    orientationChange: function(){

        // If the game is in portrait (which is horribly wrong) pause and display an error.
        // This should be removed before launch as a user's game can't pause in a multiplayer match
        if (game.scale.isPortrait){
            game.paused = true;
            this.rotateLabel.text = 'Rotate your device to landscape';

        } else {

            // Resume the game
            game.paused = false;
            this.rotateLabel.text = "";

        }
    },

    changeWeapon: function() {

        if (currentWeapon > weapons.length) {
            weapons[currentWeapon].reset();
        } else {
            weapons[currentWeapon].visible = false;
            weapons[currentWeapon].callAll('reset', null, 0, 0);
            weapons[currentWeapon].setAll('exists', false);
        }

        currentWeapon++;

        if (currentWeapon === weapons.length) {
            currentWeapon = 0;
        }

        weapons[currentWeapon].visible = true;

        scoreText.setText( 'SCORE: ' + game.global.score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name);

    },

    bulletCollision: function(sprite, weapon) {

        if (weapons[currentWeapon].name == 'OBSIDIAN') {
            this.physics.arcade.collide(weapon, sprite, this.callDamage, null, this);
        } else {
            this.physics.arcade.overlap(weapon, sprite, this.callDamage, null, this);
        }

    },

    callDamage: function(sprite, weapon) {

        var bullet = weapon;

        var damage;
        switch (weapon.key) {
            case 'diamondb':
                damage = SHIP_BASIC_DAM;
                bullet.kill();
                break;
            case 'rubyb':
                damage = SHIP_ROCKT_DAM;
                bullet.kill();
                break;
            case 'sunstoneb':
                damage = SHIP_CRESC_DAM;
                if (sprite.burn == false) {
                    if (sunstoneTier < 3) {
                        this.game.time.events.repeat(Phaser.Timer.SECOND, 2, this.callDamage, this, sprite, 'lessburn');
                    } else if (sunstoneTier == 3) {
                        this.game.time.events.repeat(Phaser.Timer.SECOND, 2, this.callDamage, this, sprite, 'moreburn');
                    }
                    sprite.burn = true;
                    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.ointment, this, sprite);
                }
                bullet.kill();
                break;
            case 'topazb':
                damage = SHIP_ELECT_DAM;
                bullet.kill();
                break;
            case 'emeraldb':
                damage = SHIP_LEECH_DAM;
                bullet.kill();
                break;
            case 'amethystb':
                if (amethystTier < 3) {
                    damage = SHIP_BLAST_DAM;
                } else if (amethystTier == 3) {
                    damage = SHIP_BLAST_DAM * 0.5;
                }
                bullet.kill();
                break;
            case 'sapphireb':
                damage = SHIP_FREZE_DAM;
                if (sprite.frozen == false && sprite.iceStack < 3) {
                    sprite.frozen = true;
                    sprite.iceStack++;
                    this.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.defrost, this, sprite);
                }
                if (sapphireTier == 3 && Math.random() < 0.25) {
                    sprite.stopped = true;
                    this.game.time.events.add(Phaser.Timer.SECOND * 1.5, this.defrost, this, sprite);
                }
                bullet.kill();
                break;
            case 'obsidianb':
                damage = SHIP_EXPLD_DAM;
                bullet.kill();
                break;
            case 'basicb':
                damage = ENEM_BASIC_DAM;
                bullet.kill();
                break;
            case 'bruiserb':
                damage = ENEM_BRUIS_DAM;
                bullet.kill();
                break;
            case 'captainb':
                damage = ENEM_CAPTN_DAM;
                bullet.kill();
                break;
            case 'govtb':
                damage = ENEM_GOVMT_DAM;
                bullet.kill();
                break;
        }

        if (weapon == 'lessburn') {
            damage = 3;
        } else if (weapon == 'moreburn') {
            damage = 5;
        }

        if (sprite.health <= 0 && sprite.alive == true) {
            sprite.kill();

            // Drops
            if (asteroids.children.indexOf(sprite) > -1) {
                sprite.spawnDrop();
                sprite.bust();
                this.astCount--;
            } else if (enemies.children.indexOf(sprite) > -1) {
                sprite.dropLoot();
                enemiesAlive--;
            } else if (sprite.key == 'comet') {
                sprite.dropLoot();
            }

            // Scores (+ escape pod)
            if (sprite.key == 'basic') {
                game.global.score += 10;
            } else if (sprite.key == 'bruiser') {
                game.global.score += 20;
            } else if (sprite.key == 'govt') {
                game.global.score += 15;
            } else if (sprite.key == 'captain') {
                game.global.score += 30;
                sprite.escapePod();
            } else if (sprite.key == 'escape') {
                game.global.score += 50;
            }

        } else if (sprite.health > 0) {
            // Dust shield takes damage
            if (sprite.key == 'ship' && DUST_COLLECTED > 0) {
                this.shield.scale.x -= damage * .0025;
                DUST_COLLECTED -= damage;
                if (DUST_COLLECTED < 0) {
                    DUST_COLLECTED = 0;
                    this.shield.scale.x = 0;
                }
                // Player takes damage w/o shield
            } else if (sprite.key == 'ship' && DUST_COLLECTED <= 0) {
                healthbar.scale.x -= damage/SHIP_HEALTH;
                sprite.health -= damage;
                DUST_COLLECTED = 0;
                // Non-player damage
            } else if (sprite.key == 'basic') {
                sprite.healthbar.scale.x -= damage/BASIC_HEALTH;
                sprite.health -= damage;
            } else if (sprite.key == 'bruiser') {
                sprite.healthbar.scale.x -= damage/BRUISER_HEALTH;
                sprite.health -= damage;
            } else if (sprite.key == 'captain') {
                sprite.healthbar.scale.x -= damage/CAPTAIN_HEALTH;
                sprite.health -= damage;
            } else if (sprite.key == 'escape') {
                sprite.healthbar.scale.x -= damage/ESCAPE_POD_HEALTH;
                sprite.health -= damage;
            } else if (sprite.key == 'govt') {
                sprite.healthbar.scale.x -= damage/GOVT_HEALTH;
                sprite.health -= damage;
                // Asteroids and comets
            } else {
                sprite.health -= damage;
            }
        }

        scoreText.setText( 'SCORE: ' + game.global.score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name);

    },

    updateBar: function (spritebar, sprite) {

        // Updates healthbar of sprites
        if (sprite.health <= 0 ) {
            spritebar.kill();
        }

        spritebar.centerX = sprite.centerX;
        spritebar.centerY = sprite.centerY + 30;

    },

    defrost: function(sprite) {

        // Returns sprite speeds to normal
        switch (sprite.key) {
            case 'basic':
            case 'govt':
                sprite.speed = 150;
                break;
            case 'bruiser':
                sprite.speed = 100;
                break;
            case 'captain':
                sprite.speed = 230;
                break;
            case 'escape':
                sprite.speed = 400;
                break;
        }

        // Wipes ice stack
        sprite.iceStack = 0;

    },

    ointment: function(sprite) {

        // Sprite no longer takes burn damage
        sprite.burn = false;

    },

    collectMaterial: function(ship, material) {

        // Metal pickup
        if (metals.children.indexOf(material) > -1) {
            collectedMetals.push(material);
            this.physics.arcade.overlap(ship, metals.children.indexOf(material), this.moneySound.play(), null, this);
        }

        // Crystal pickup
        if (material.key == 'opal') {
            var randomUpgrade = Math.ceil(Math.random() * 8);
        }

        if (material.key == 'diamond' || randomUpgrade == 1) {
            if (diamondTier == 0) {
                weapons.push(new Weapon.Diamond(this.game));
                diamondTier += 1;
            } else if (diamondTier < 3) {
                diamondTier += 1;
            }
            console.log('Diamond is now Tier ' + diamondTier + '.');
        } else if (material.key == 'ruby' || randomUpgrade == 2) {
            if (rubyTier == 0) {
                weapons.push(new Weapon.Ruby(this.game));
                rubyTier += 1;
            } else if (rubyTier < 3) {
                rubyTier += 1;
            }
            console.log('Ruby is now Tier ' + rubyTier + '.');
        } else if (material.key == 'sunstone' || randomUpgrade == 3) {
            if (sunstoneTier == 0) {
                weapons.push(new Weapon.Sunstone(this.game));
                sunstoneTier += 1;
            } else if (sunstoneTier < 3) {
                sunstoneTier += 1;
            }
            console.log('Sunstone is now Tier ' + sunstoneTier + '.');
        } else if (material.key == 'topaz' || randomUpgrade == 4) {
            if (topazTier == 0) {
                // weapons.push(new Weapon.Topaz(this.game));
                topazTier += 1;
            } else if (topazTier < 3) {
                topazTier += 1;
            }
            console.log('Topaz is now Tier ' + topazTier + '.');
        } else if (material.key == 'emerald' || randomUpgrade == 5) {
            if (emeraldTier == 0) {
                // weapons.push(new Weapon.Emerald(this.game));
                emeraldTier += 1;
            } else if (emeraldTier < 3) {
                emeraldTier += 1;
            }
            console.log('Emerald is now Tier ' + emeraldTier + '.');
        } else if (material.key == 'sapphire' || randomUpgrade == 6) {
            if (sapphireTier == 0) {
                weapons.push(new Weapon.Sapphire(this.game));
                sapphireTier += 1;
            } else if (sapphireTier < 3) {
                sapphireTier += 1;
            }
            console.log('Sapphire is now Tier ' + sapphireTier + '.');
        } else if (material.key == 'amethyst' || randomUpgrade == 7) {
            if (amethystTier == 0) {
                weapons.push(new Weapon.Amethyst(this.game));
                amethystTier += 1;
            } else if (amethystTier < 3) {
                amethystTier += 1;
            }
            console.log('Amethyst is now Tier ' + amethystTier + '.');
        } else if (material.key == 'obsidian' || randomUpgrade == 8) {
            if (obsidianTier == 0) {
                weapons.push(new Weapon.Obsidian(this.game));
                obsidianTier += 1;
            } else if (obsidianTier < 3) {
                obsidianTier += 1;
            }
            console.log('Obsidian is now Tier ' + obsidianTier + '.');
        }

        // Dust pickup
        if (DUST_COLLECTED < 200) {
            if (material.key == 'smlDust') {
                DUST_COLLECTED += 1;
                this.shield.scale.x += .0025;
            } else if (material.key == 'medDust') {
                DUST_COLLECTED += 3;
                this.shield.scale.x += .0075;
            } else if (material.key == 'bigDust') {
                DUST_COLLECTED += 6;
                this.shield.scale.x += .015;
            }
        }
        if (DUST_COLLECTED > 200) {
            DUST_COLLECTED = 200;
        }

        // Anomaly pickup
        switch (material.key) {
            case 'infinity':
                console.log(material.key);
                break;
            case 'magnet':
                console.log(material.key);
                break;
            case 'blackhole':
                console.log(material.key);
                break;
            case 'transmute':
                console.log(material.key);
                break;
            case 'drone':
                console.log(material.key);
                break;
            case 'invisible':
                console.log(material.key);
                break;
            case 'bomb':
                console.log(material.key);
                break;
            case 'warp':
                console.log(material.key);
                break;
        }

        scoreText.setText( 'SCORE: ' + game.global.score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name);
        material.kill();

    },

    // --- ASTEROIDS

    // Asteroid template with physics and standard variables
    Asteroid: function(game, x, y, type, scale, health, speed) {

        var randDirect = Math.random() < 0.5 ? 1 : -1;
        this.game = game;
        this.health = health;
        this.speed = speed;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.scale.setTo(scale);
        this.body.velocity.setTo(this.speed * randDirect, this.speed * randDirect);

    },

    // --- DUST

// Dust template with physics and standard variables
    Dust: function (game, x, y, type) {

        this.game = game;
        var randoDirect = Math.random() < 0.5 ? 1 : -1;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.velocity.setTo(5 * randoDirect, 5 * randoDirect);

    },

    // --- METALS

// Metal template with physics and standard variables
    Metal: function(game, x, y, type) {

        this.game = game;
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.velocity.setTo(5 * plusOrMinus, 5 * plusOrMinus);
        this.body.bounce.set(0.5);

        switch(this.key){
            case 'Li':
                this.value = 3;
                break;
            case 'C':
                this.value = 6;
                break;
            case 'Al':
                this.value = 13;
                break;
            case 'Ti':
                this.value = 22;
                break;
            case 'Cr':
                this.value = 24;
                break;
            case 'Fe':
                this.value = 26;
                break;
            case 'Co':
                this.value = 27;
                break;
            case 'Ni':
                this.value = 28;
                break;
            case 'Cu':
                this.value = 29;
                break;
            case 'Zn':
                this.value = 30;
                break;
            case 'Pd':
                this.value = 46;
                break;
            case 'Ag':
                this.value = 47;
                break;
            case 'Sn':
                this.value = 50;
                break;
            case 'Nd':
                this.value = 60;
                break;
            case 'W':
                this.value = 74;
                break;
            case 'Pt':
                this.value = 78;
                break;
            case 'Au':
                this.value = 79;
                break;
            case 'Hg':
                this.value = 80;
                break;
        }

    },

    // --- CRYSTALS

// Crystal template with physics and standard variables
    Crystal: function(game, x, y, type) {

        this.game = game;
        var minusOrPlus = Math.random() < 0.5 ? 1 : -1;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.velocity.setTo(5 * minusOrPlus, 5 * minusOrPlus);
        this.body.bounce.set(0.5);

    },

    // --- CRYSTAL WEAPONS

// Basic constructor
    PlayerBullet: function(game, type) {

        this.game = game;

        Phaser.Sprite.call(this, game, 0, 0, type);

        this.anchor.setTo(0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;

    },

    // --- ANOMALIES

// Anomaly template with physics and standard variables
    Anomaly: function(game, x, y, type) {

        this.game = game;
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.velocity.setTo(5 * plusOrMinus, 5 * plusOrMinus);
        this.body.bounce.set(0.5);

    },

    anomalyEffect: function(ship, anomaly) {

        switch (anomaly.key) {
            case 'infinity':
                console.log(anomaly.key + " infinity effect");
                var savedDust = DUST_COLLECTED;
                DUST_COLLECTED = 9999;
                game.time.events.add(10000, function(){
                    DUST_COLLECTED = savedDust;
                }, this);

                break;
            case 'magnet':
                console.log(anomaly.key + " mag effect");

                break;
            case 'blackhole':
                console.log(anomaly.key + " blk effect");

                break;
            case 'transmute':
                console.log(anomaly.key + " trans effect");

                break;
            case 'drone':
                console.log(anomaly.key + " drone effect");

                break;
            case 'invisible':
                console.log(anomaly.key + " invisible effect");

                break;
            case 'bomb':
                console.log(anomaly.key + " bomb effect");

                break;
            case 'warp':

                console.log(anomaly.key + " warp effect");
                this.ship.x = this.game.world.randomX;
                this.ship.y = this.game.world.randomY;
                break;
        }

    },

    // --- COMETS

    Comet: function(game, x, y, type, health) {

        this.game = game;
        this.health = health;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.outOfBoundsKill = true;

        this.emitter = game.add.emitter(0, 0, 400);

        this.emitter.makeParticles(['particle1']);

        this.emitter.gravity = 0;
        this.emitter.setAlpha(1, 0, 3000);
        this.emitter.setScale(0.8, 0, 0.8, 0, 3000);
        this.emitter.angle = 180;

        this.emitter.start(false, 3000, 5);
        this.addChild(this.emitter);

    },

    newComet: function() {

        //var upDownLeftRight = Math.random();

        /**if (upDownLeftRight >= .75) {
            var comet = new this.Comet(this.game, 0, this.game.world.randomY, 'comet', COMET_HEALTH);
            console.log('A comet at ' + comet.x + ", " + comet.y);
            comet.body.velocity.setTo(75, COMET_SPEED);
            comet.scale.setTo(2);
            comets.add(comet);

        } else if (upDownLeftRight >= .5) {
            comet = new this.Comet(this.game, 5000, this.game.world.randomY, 'comet', COMET_HEALTH);
            console.log('A comet at ' + comet.x + ", " + comet.y);
            comet.body.velocity.setTo(-75, COMET_SPEED * -1);
            comet.scale.setTo(2);
            comets.add(comet);

        } else if (upDownLeftRight >= .25) {
            comet = new this.Comet(this.game, this.game.world.randomX, 0, 'comet', COMET_HEALTH);
            console.log('A comet at ' + comet.x + ", " + comet.y);
            comet.body.velocity.setTo(75, COMET_SPEED);
            comet.scale.setTo(2);
            comets.add(comet);

        } else {
            comet = new this.Comet(this.game, this.game.world.randomX, 5000, 'comet', COMET_HEALTH);
            console.log('A comet at ' + comet.x + ", " + comet.y);
            comet.body.velocity.setTo(-75, COMET_SPEED * -1);
            comet.scale.setTo(2);
            comets.add(comet);
        }

         comet.spawn(); **/

    },

    // --- ENEMIES

// Enemy template with physics and standard variables
    Enemy: function(game, x, y, type, speed, health, player) {

        this.game = game;
        this.speed = speed;
        this.health = health;
        this.player = player;
        this.frozen = false;
        this.iceStack = 0;
        this.stopped = false;
        this.burn = false;
        this.aggroRange = 400;
        this.minDist = 100;
        this.shootNow = 0;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.drag.setTo(10, 10);
        this.minMove = 600;

        // Create a timer
        this.moveTimer = this.game.time.create(false);
        this.moveTimer.start();

        this.shootTimer = this.game.time.create(false);
        this.shootTimer.start();

        // Time in which the enemies change direction
        this.recalcMovement = 500;
        this.minimumRecalc = 3000;
        this.nextTurn = 0;

        this.healthbar = game.make.sprite(-10, -20, 'health');
        this.healthbar.anchor.setTo(0.5);
        this.addChild(this.healthbar);

    },

    EnemyBullet: function(game, x, y, type, player, speed, posVar) {

        this.game = game;

        Phaser.Sprite.call(this, game, x, y, type);

        this.game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.game.physics.arcade.moveToXY(this, player.x + posVar, player.y + posVar, speed);

    },

    newEnemies: function() {

        if (enemiesAlive < 1) {

            for (var i = 0; i < 5; i++) {
                var basic = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'basic', BASIC_SPEED, BASIC_HEALTH, this.ship);
                enemies.add(basic);
                enemiesAlive++;
            }
            for (var i = 0; i < 3; i++) {
                var bruiser = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'bruiser', BRUISER_SPEED, BRUISER_HEALTH, this.ship);
                enemies.add(bruiser);
                enemiesAlive++;
            }
            for (var m = 0; m < 1; m++) {
                var captain = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'captain', CAPTAIN_SPEED, CAPTAIN_HEALTH, this.ship);
                enemies.add(captain);
                enemiesAlive++;
            }
            for (var i = 0; i < 5; i++) {
                var govt = new this.Enemy(this.game, this.game.world.randomX, this.game.world.randomY, 'govt', GOVT_SPEED, GOVT_HEALTH, this.ship);
                enemies.add(govt);
                enemiesAlive++;
            }
        }

    }

};

playState.Asteroid.prototype = Object.create(Phaser.Sprite.prototype);
playState.Asteroid.prototype.constructor = playState.Asteroid;

playState.Asteroid.prototype.spawnDrop = function() {

    var posVar = Math.ceil(Math.random() * 20);
    var metalDropRate = Math.ceil(Math.random() * 100);
    var metalDropAmt = Math.floor(Math.random() * 5);
    var crystalDropRate = Math.ceil(Math.random() * 100);

    if (this.health < 1) {

        // Metal drops
        if (metalDropRate < 5) {

            for (var h = 0; h < metalDropAmt; h++) {
                metal = new playState.Metal(this.game, this.x + (h * posVar), this.y + (h * posVar), 'Hg');
                metals.add(metal);
            }

        } else if (metalDropRate < 10) {

            for (var k = 0; k < metalDropAmt; k++) {
                metal = new playState.Metal(this.game, this.x + (k * posVar), this.y + (k * posVar), 'Au');
                metals.add(metal);
            }

        } else if (metalDropRate < 15) {

            for (var l = 0; l < metalDropAmt; l++) {
                metal = new playState.Metal(this.game, this.x + (l * posVar), this.y + (l * posVar), 'Pt');
                metals.add(metal);
            }

        } else if (metalDropRate < 20) {

            for (var m = 0; m < metalDropAmt; m++) {
                metal = new playState.Metal(this.game, this.x + (m * posVar), this.y + (m * posVar), 'W');
                metals.add(metal);
            }

        } else if (metalDropRate < 25) {

            for (var n = 0; n < metalDropAmt; n++) {
                metal = new playState.Metal(this.game, this.x + (n * posVar), this.y + (n * posVar), 'Nd');
                metals.add(metal);
            }

        } else if (metalDropRate < 30) {

            for (var o = 0; o < metalDropAmt; o++) {
                metal = new playState.Metal(this.game, this.x + (o * posVar), this.y + (o * posVar), 'Sn');
                metals.add(metal);
            }

        } else if (metalDropRate < 40) {

            for (var p = 0; p < metalDropAmt; p++) {
                metal = new playState.Metal(this.game, this.x + (p * posVar), this.y + (p * posVar), 'Ag');
                metals.add(metal);
            }

        } else if (metalDropRate < 45) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Pd');
                metals.add(metal);
            }

        } else if (metalDropRate < 50) {

            for (var q = 0; q < metalDropAmt; q++) {
                metal = new playState.Metal(this.game, this.x + (q * posVar), this.y + (q * posVar), 'Zn');
                metals.add(metal);
            }

        } else if (metalDropRate < 55) {

            for (var r = 0; r < metalDropAmt; r++) {
                metal = new playState.Metal(this.game, this.x + (r * posVar), this.y + (r * posVar), 'Cu');
                metals.add(metal);
            }

        } else if (metalDropRate < 60) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Ni');
                metals.add(metal);
            }

        } else if (metalDropRate < 65) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Co');
                metals.add(metal);
            }

        } else if (metalDropRate < 70) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Fe');
                metals.add(metal);
            }

        } else if (metalDropRate < 75) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Cr');
                metals.add(metal);
            }

        } else if (metalDropRate < 80) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Ti');
                metals.add(metal);
            }

        } else if (metalDropRate < 85) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Al');
                metals.add(metal);
            }

        } else if (metalDropRate < 90) {

            for (var i = 0; i < metalDropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Li');
                metals.add(metal);
            }

        }

        // Crystal drops
        if (crystalDropRate <= 100) {
            var crystalKey = ['diamond', 'ruby', 'sunstone', 'topaz', 'emerald', 'sapphire', 'amethyst', 'obsidian', 'opal'][Math.floor(Math.random() * 9)];
            crystal = new playState.Crystal(this.game, this.x + posVar, this.y + posVar, crystalKey);
            crystals.add(crystal);
        }

        // Dust drops
        switch (this.key) {
            case 'bigRedAst':
            case 'bigBlueAst':
            case 'bigWhiteAst':
            case 'bigGreyAst':
            case 'bigBrownAst':
                for (var z = 0; z < 5; z++) {
                    dust = new playState.Dust(this.game, this.x + z + posVar, this.y + z + posVar, 'bigDust');
                    dusts.add(dust);
                }
                break;
            case 'medRedAst':
            case 'medBlueAst':
            case 'medWhiteAst':
            case 'medGreyAst':
            case 'medBrownAst':
                for (var zy = 0; zy < 3; zy++) {
                    dust = new playState.Dust(this.game, this.x + posVar, this.y + posVar, 'medDust');
                    dusts.add(dust);
                }
                break;
            case 'smlRedAst':
            case 'smlBlueAst':
            case 'smlWhiteAst':
            case 'smlGreyAst':
            case 'smlBrownAst':
                for (var zyx = 0; zyx < 3; zyx++) {
                    dust = new playState.Dust(this.game, this.x + posVar, this.y + posVar, 'smlDust');
                    dusts.add(dust);
                }
                break;
        }
    }
};

playState.Asteroid.prototype.bust = function() {

    var posVar = Math.ceil(Math.random() * 20);

    if (this.key == 'bigBlueAst') {
        for (var a = 0; a < (Math.ceil(Math.random() * 3)); a++) {
            var medAst = new playState.Asteroid(this.game, this.x + ((a + 1) * posVar), this.y + ((a + 1) * posVar), 'medBlueAst', MED_AST_SCALE, MED_AST_HEALTH, MED_AST_SPEED);
            medAst.body.bounce.set(0.5);
            asteroids.add(medAst);
            playState.astCount++;
        }
    } else if (this.key == 'medBlueAst') {
        for (var b = 0; b < (Math.ceil(Math.random() * 3)); b++) {
            var smlAst = new playState.Asteroid(this.game, this.x + ((b + 1) * posVar), this.y + ((b + 1) * posVar), 'smlBlueAst', SML_AST_SCALE, SML_AST_HEALTH, SML_AST_SPEED);
            smlAst.body.bounce.set(0.5);
            asteroids.add(smlAst);
            playState.astCount++;
        }
    } else if (this.key == 'bigGreyAst') {
        for (var a = 0; a < (Math.ceil(Math.random() * 3)); a++) {
            var medAst = new playState.Asteroid(this.game, this.x + ((a + 1) * posVar), this.y + ((a + 1) * posVar), 'medGreyAst', MED_AST_SCALE, MED_AST_HEALTH, MED_AST_SPEED);
            medAst.body.bounce.set(0.5);
            asteroids.add(medAst);
            playState.astCount++;
        }
    } else if (this.key == 'medGreyAst') {
        for (var b = 0; b < (Math.ceil(Math.random() * 3)); b++) {
            var smlAst = new playState.Asteroid(this.game, this.x + ((b + 1) * posVar), this.y + ((b + 1) * posVar), 'smlGreyAst', SML_AST_SCALE, SML_AST_HEALTH, SML_AST_SPEED);
            smlAst.body.bounce.set(0.5);
            asteroids.add(smlAst);
            playState.astCount++;
        }
    } else if (this.key == 'bigBrownAst') {
        for (var a = 0; a < (Math.ceil(Math.random() * 3)); a++) {
            var medAst = new playState.Asteroid(this.game, this.x + ((a + 1) * posVar), this.y + ((a + 1) * posVar), 'medBrownAst', MED_AST_SCALE, MED_AST_HEALTH, MED_AST_SPEED);
            medAst.body.bounce.set(0.5);
            asteroids.add(medAst);
            playState.astCount++;
        }
    } else if (this.key == 'medBrownAst') {
        for (var b = 0; b < (Math.ceil(Math.random() * 3)); b++) {
            var smlAst = new playState.Asteroid(this.game, this.x + ((b + 1) * posVar), this.y + ((b + 1) * posVar), 'smlBrownAst', SML_AST_SCALE, SML_AST_HEALTH, SML_AST_SPEED);
            smlAst.body.bounce.set(0.5);
            asteroids.add(smlAst);
            playState.astCount++;
        }
    } else if (this.key == 'bigRedAst') {
        for (var a = 0; a < (Math.ceil(Math.random() * 3)); a++) {
            var medAst = new playState.Asteroid(this.game, this.x + ((a + 1) * posVar), this.y + ((a + 1) * posVar), 'medRedAst', MED_AST_SCALE, MED_AST_HEALTH, MED_AST_SPEED);
            medAst.body.bounce.set(0.5);
            asteroids.add(medAst);
            playState.astCount++;
        }
    } else if (this.key == 'medRedAst') {
        for (var b = 0; b < (Math.ceil(Math.random() * 3)); b++) {
            var smlAst = new playState.Asteroid(this.game, this.x + ((b + 1) * posVar), this.y + ((b + 1) * posVar), 'smlRedAst', SML_AST_SCALE, SML_AST_HEALTH, SML_AST_SPEED);
            smlAst.body.bounce.set(0.5);
            asteroids.add(smlAst);
            playState.astCount++;
        }
    } else if (this.key == 'bigWhiteAst') {
        for (var a = 0; a < (Math.ceil(Math.random() * 3)); a++) {
            var medAst = new playState.Asteroid(this.game, this.x + ((a + 1) * posVar), this.y + ((a + 1) * posVar), 'medWhiteAst', MED_AST_SCALE, MED_AST_HEALTH, MED_AST_SPEED);
            medAst.body.bounce.set(0.5);
            asteroids.add(medAst);
            playState.astCount++;
        }
    } else if (this.key == 'medWhiteAst') {
        for (var b = 0; b < (Math.ceil(Math.random() * 3)); b++) {
            var smlAst = new playState.Asteroid(this.game, this.x + ((b + 1) * posVar), this.y + ((b + 1) * posVar), 'smlWhiteAst', SML_AST_SCALE, SML_AST_HEALTH, SML_AST_SPEED);
            smlAst.body.bounce.set(0.5);
            asteroids.add(smlAst);
            playState.astCount++;
        }
    }
};

playState.Asteroid.prototype.update = function() {

    this.angle += 0.5;

};

playState.Dust.prototype = Object.create(Phaser.Sprite.prototype);
playState.Dust.prototype.constructor = playState.Dust;

playState.Metal.prototype = Object.create(Phaser.Sprite.prototype);
playState.Metal.prototype.constructor = playState.Metal;

playState.Crystal.prototype = Object.create(Phaser.Sprite.prototype);
playState.Crystal.prototype.constructor = playState.Crystal;


playState.PlayerBullet.prototype = Object.create(Phaser.Sprite.prototype);
playState.PlayerBullet.prototype.constructor = playState.PlayerBullet;

playState.PlayerBullet.prototype.shoot = function(x, y, posVar, speed) {

    this.reset(x, y);

    if (weapons[currentWeapon].name == 'SUNSTONE' && sunstoneTier == 1) {
        this.scale.setTo(0.75);
    }

    if (weapons[currentWeapon].name == 'AMETHYST' && amethystTier > 1) {
        this.scale.setTo(1, 2);
    }

    var pos = game.input.activePointer.position;

    x = this.game.input.activePointer.worldX + posVar;
    y = this.game.input.activePointer.worldY + posVar;

    this.game.physics.arcade.moveToXY(this, x, y, speed);

};

playState.PlayerBullet.prototype.update = function() {

    this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);

};

// Diamond weapon
Weapon.Diamond = function(game) {

    Phaser.Group.call(this, game, game.world, 'DIAMOND', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 600;
    this.fireRate = 300;

    for (var i = 0; i < 120; i++) {
        this.add(new playState.PlayerBullet(game, 'diamondb'), true);
    }

    return this;

};

Weapon.Diamond.prototype = Object.create(Phaser.Group.prototype);
Weapon.Diamond.prototype.constructor = Weapon.Diamond;

Weapon.Diamond.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    if (diamondTier == 1) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
        playState.diamondShot.play();

    } else if (diamondTier == 2) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 3, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, -3, this.bulletSpeed);
        playState.diamondShot.play();
    } else if (diamondTier == 3) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, 5, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, -5, this.bulletSpeed);
        playState.diamondShot.play();
    }
    this.shootNow = this.game.time.time + this.fireRate;

};

// Ruby weapon
Weapon.Ruby = function(game) {

    Phaser.Group.call(this, game, game.world, 'RUBY', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 600;
    this.fireRate = 400;

    for (var i = 0; i < 80; i++) {
        this.add(new playState.PlayerBullet(game, 'rubyb'), true);
    }

    return this;

};

Weapon.Ruby.prototype = Object.create(Phaser.Group.prototype);
Weapon.Ruby.prototype.constructor = Weapon.Ruby;

Weapon.Ruby.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    if (rubyTier < 3) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
    } else if (rubyTier == 3) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, 5, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, -5, this.bulletSpeed);
    }
    this.shootNow = this.game.time.time + this.fireRate;

};

// Sunstone weapon
Weapon.Sunstone = function(game) {

    Phaser.Group.call(this, game, game.world, 'SUNSTONE', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 600;
    this.fireRate = 500;

    for (var i = 0; i < 80; i++) {
        this.add(new playState.PlayerBullet(game, 'sunstoneb'), true);
    }

    return this;

};

Weapon.Sunstone.prototype = Object.create(Phaser.Group.prototype);
Weapon.Sunstone.prototype.constructor = Weapon.Sunstone;

Weapon.Sunstone.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    if (sunstoneTier == 1) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
    } else if (sunstoneTier > 1) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
    }
    this.shootNow = this.game.time.time + this.fireRate;

};

// Topaz weapon
Weapon.Topaz = function(game) {

    Phaser.Group.call(this, game, game.world, 'TOPAZ', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 500;
    this.fireRate = 400;

    for (var i = 0; i < 60; i++) {
        this.add(new playState.PlayerBullet(game, 'topazb'), true);
    }

    return this;

};

Weapon.Topaz.prototype = Object.create(Phaser.Group.prototype);
Weapon.Topaz.prototype.constructor = Weapon.Topaz;

Weapon.Topaz.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);

    this.shootNow = this.game.time.time + this.fireRate;

};

// Amethyst weapon
Weapon.Amethyst = function(game) {

    Phaser.Group.call(this, game, game.world, 'AMETHYST', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 900;
    this.fireRate = 10;

    for (var i = 0; i < 200; i++) {
        this.add(new playState.PlayerBullet(game, 'amethystb'), true);
    }

    return this;

};

Weapon.Amethyst.prototype = Object.create(Phaser.Group.prototype);
Weapon.Amethyst.prototype.constructor = Weapon.Amethyst;

Weapon.Amethyst.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);

    this.shootNow = this.game.time.time + this.fireRate;

};

// Sapphire weapon
Weapon.Sapphire = function(game) {

    Phaser.Group.call(this, game, game.world, 'SAPPHIRE', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 600;
    this.fireRate = 200;

    for (var i = 0; i < 80; i++) {
        this.add(new playState.PlayerBullet(game, 'sapphireb'), true);
    }

    return this;

};

Weapon.Sapphire.prototype = Object.create(Phaser.Group.prototype);
Weapon.Sapphire.prototype.constructor = Weapon.Sapphire;

Weapon.Sapphire.prototype.shoot = function (ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);

    this.shootNow = this.game.time.time + this.fireRate;

};

// Obsidian weapon
Weapon.Obsidian = function(game) {

    Phaser.Group.call(this, game, game.world, 'OBSIDIAN', false, true, Phaser.Physics.ARCADE);

    this.shootNow = 0;
    this.bulletSpeed = 500;
    this.fireRate = 500;

    for (var i = 0; i < 80; i++) {
        this.add(new playState.PlayerBullet(game, 'obsidianb'), true);
    }

    return this;

};

Weapon.Obsidian.prototype = Object.create(Phaser.Group.prototype);
Weapon.Obsidian.prototype.constructor = Weapon.Obsidian;

Weapon.Obsidian.prototype.shoot = function(ship) {

    if (this.game.time.time < this.shootNow) {
        return;
    }

    if (obsidianTier == 1) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
    } else if (obsidianTier == 2) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 3, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, -3, this.bulletSpeed);
    } else if (obsidianTier == 3) {
        this.getFirstExists(false).shoot(ship.x, ship.y, 0, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, 5, this.bulletSpeed);
        this.getFirstExists(false).shoot(ship.x, ship.y, -5, this.bulletSpeed);
    }
    this.shootNow = this.game.time.time + this.fireRate;

};

playState.Anomaly.prototype = Object.create(Phaser.Sprite.prototype);
playState.Anomaly.prototype.constructor = playState.Anomaly;



playState.Anomaly.prototype.spawn = function() {

    game.time.events.add(15000, function(){

        var anomalyKey = ['infinity', 'magnet', 'blackhole', 'transmute', 'drone', 'invisible', 'bomb', 'warp'][Math.floor(Math.random() * 8)];
        anomaly = new playState.Anomaly(this.game, this.game.world.randomX, this.game.world.randomY, 'warp');
        console.log('New anomaly at ' + anomaly.x + ", " + anomaly.y);
        anomalies.add(anomaly);
        anomaly.spawn();
        game.time.events.add(10000, function() {
            anomaly.kill();}, this);}, this);

};

playState.Comet.prototype = Object.create(Phaser.Sprite.prototype);
playState.Comet.prototype.constructor = playState.Comet;

playState.Comet.prototype.dropLoot = function() {

    var drop = Math.ceil(Math.random() * 4);
    var posVar = Math.ceil(Math.random() * 20);
    var dropAmt = Math.floor(Math.random() * 20);

    switch (drop) {
        case 1:
            for (var i = 0; i < dropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Nd');
                metals.add(metal);
            }
            break;
        case 2:
            for (var i = 0; i < dropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'W');
                metals.add(metal);
            }
            break;
        case 3:
            for (var i = 0; i < dropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Pt');
                metals.add(metal);
            }
            break;
        case 4:
            for (var i = 0; i < dropAmt; i++) {
                metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Au');
                metals.add(metal);
            }
            break;
    }

};

playState.Comet.prototype.spawn = function() {

    game.time.events.add(20000, playState.newComet, this);

};

playState.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
playState.Enemy.prototype.constructor = playState.Enemy;

// Random enemy movement around the level
playState.Enemy.prototype.move = function() {

    if (Math.round(this.moveTimer.ms) > this.nextTurn) {

        var randomDist = Math.round((Math.random() + 1) * this.minMove);
        var moveX = this.x;
        var moveY = this.y;
        var moveLeft = false;
        var moveUp = false;

        this.nextTurn = (Math.random() * this.recalcMovement + this.minimumRecalc);

        if (this.moveTimer) {
            this.moveTimer.destroy();
            this.moveTimer.ms = 0;
        }
        this.moveTimer = this.game.time.create(false);
        this.moveTimer.start();

        if (Math.random() < 0.5) {
            moveLeft = true;
        }
        if (Math.random() < 0.5) {
            moveUp = true;
        }

        if (moveLeft && !this.moveRightNext) {
            moveX -= randomDist;
            if (moveX < 30) {
                moveX = 30 + this.body.width/2;
                this.moveRightNext = true;
            }
        } else {
            moveX += randomDist;
            this.moveRightNext = false;
            if (moveX > (this.game.world.width - 30)) {
                moveX = (this.game.world.width - 30) - this.body.width/2;
            }
        }

        if (moveUp && !this.moveDownNext) {
            moveY -= randomDist;
            if (moveY < 30) {
                moveY = 30 + this.body.height/2;
                this.moveDownNext = true;
            }
        } else {
            moveY += randomDist;
            this.moveDownNext = false;
            if (moveY > (this.game.world.height - 30)) {
                moveY = (this.game.world.height - 30) - this.body.height/2;
            }
        }

        this.game.physics.arcade.moveToXY(this, moveX, moveY, this.speed);
        var angle = Math.atan2(moveY - this.y, moveX - this.x);
        this.rotation = angle;

    }

};

playState.Enemy.prototype.update = function() {

    if (this.key !== 'escape') {
        var distance = this.game.physics.arcade.distanceBetween(this.player, this);
        if (distance <= this.aggroRange && this.player.alive == true && this.alive == true) {
            if (distance >= this.minDist) {
                this.game.physics.arcade.moveToXY(this, this.player.x, this.player.y, this.speed);
            } else {
                this.body.velocity.setTo(0);
            }
            var angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
            this.rotation = angle;
            this.shoot();
        } else {
            this.move();
        }
    }

    if (this.key == 'escape') {
        this.move();
    }

    if (this.frozen == true) {
        if (sapphireTier == 1) {
            this.speed = this.speed * 0.25;
            this.frozen = false;
        } else if (sapphireTier > 1) {
            this.speed = this.speed * 0.50;
            this.frozen = false;
        }
    }

    if (this.stopped == true) {
        this.speed = 0;
        this.stopped = false;
    }

};

playState.Enemy.prototype.shoot = function() {

    switch (this.key) {
        case 'basic':
            var timeNow = this.shootTimer.ms;
            if (this.shootNow < timeNow) {
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'basicb', this.player, 450, null);
                enemyWeapon.add(enemyBullet);
                playState.basicShot.play();
                this.shootNow = timeNow + 500;
            }
            break;
        case 'bruiser':
            timeNow = this.shootTimer.ms;
            if (this.shootNow < timeNow) {
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'bruiserb', this.player, 300, null);
                enemyWeapon.add(enemyBullet);
                playState.bruiserShot.play();
                this.shootNow = timeNow + 2000;
            }
            break;
        case 'captain':
            timeNow = this.shootTimer.ms;
            if (this.shootNow < timeNow) {
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'captainb', this.player, 600, null);
                enemyWeapon.add(enemyBullet);
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'captainb', this.player, 600, 15);
                enemyWeapon.add(enemyBullet);
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'captainb', this.player, 600, -15);
                enemyWeapon.add(enemyBullet);
                playState.captainShot.play();
                this.shootNow = timeNow + 1000;
            }
            break;
        case 'govt':
            timeNow = this.shootTimer.ms;
            if (this.shootNow < timeNow) {
                enemyBullet = new playState.EnemyBullet(this.game, this.x, this.y, 'govtb', this.player, 450, null);
                enemyWeapon.add(enemyBullet);
                playState.diamondShot.play();
                this.shootNow = timeNow + 250;
            }
            break;
    }

};

playState.Enemy.prototype.escapePod = function() {

    var escapePod = new playState.Enemy(this.game, this.x, this.y, 'escape', ESCAPE_POD_SPEED, ESCAPE_POD_HEALTH);
    enemies.add(escapePod);

};

playState.Enemy.prototype.dropLoot = function(){

    var enemyDrop = Math.ceil(Math.random() * 4);
    var posVar = Math.ceil(Math.random() * 20);
    var dropAmt = Math.floor(Math.random() * 5);

    switch (this.key) {
        case 'basic':
            switch (enemyDrop) {
                case 1:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Li');
                        metals.add(metal);
                    }
                    break;
                case 2:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Al');
                        metals.add(metal);
                    }
                    break;
                case 3:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Ti');
                        metals.add(metal);
                    }
                    break;
                case 4:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Cr');
                        metals.add(metal);
                    }
                    break;
            }
            break;
        case 'bruiser':
            switch (enemyDrop) {
                case 1:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Fe');
                        metals.add(metal);
                    }
                    break;
                case 2:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Co');
                        metals.add(metal);
                    }
                    break;
                case 3:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Ni');
                        metals.add(metal);
                    }
                    break;
                case 4:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Cu');
                        metals.add(metal);
                    }
                    break;
            }
            break;
        case 'govt':
            switch (enemyDrop) {
                case 1:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Zn');
                        metals.add(metal);
                    }
                    break;
                case 2:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Pd');
                        metals.add(metal);
                    }
                    break;
                case 3:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Ag');
                        metals.add(metal);
                    }
                    break;
                case 4:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Sn');
                        metals.add(metal);
                    }
                    break;
            }
            break;
        case 'captain':
            switch (enemyDrop) {
                case 1:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Nd');
                        metals.add(metal);
                    }
                    break;
                case 2:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'W');
                        metals.add(metal);
                    }
                    break;
                case 3:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Pt');
                        metals.add(metal);
                    }
                    break;
                case 4:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Au');
                        metals.add(metal);
                    }
                    break;
            }
            break;
        case 'escape':
            switch (enemyDrop) {
                case 1:
                case 2:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Au');
                        metals.add(metal);
                    }
                    break;
                case 3:
                case 4:
                    for (var i = 0; i < dropAmt; i++) {
                        metal = new playState.Metal(this.game, this.x + (i * posVar), this.y + (i * posVar), 'Hg');
                        metals.add(metal);
                    }
                    break;
            }
            break;
    }

};

playState.EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype);
playState.EnemyBullet.prototype.constructor = playState.EnemyBullet;
