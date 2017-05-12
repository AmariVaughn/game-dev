/** Copyright Ivy Tower, LLC **/

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'gameWindow');

var healthbar;
var weapons = [];
var Weapon = {};
// Player variables
var SHIP_SPEED = 300;
var SHIP_HEALTH = 200;

// Bullet damages (Tier 1)
var SHIP_BASIC_DAM = 10; // Diamond weapon




// Dust variables
var DUST_COLLECTED = 0;

// Enemy variables
var BASIC_SPEED = 150;
var BASIC_HEALTH = 50;

// --- GAMESTATE

var GameState = {

    init: function () {

        // Initiate physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

    },

    preload: function () {

        // Load assets
        this.game.load.image('bg', 'assets/background.png');
        this.game.load.image('ship', 'assets/ship.png');
        this.game.load.image('basic', 'assets/basicen.png');
        this.game.load.image('basicb', 'assets/basicbull.png');
       

    },

    create: function () {

        // --- GAME SETUP

        // Set world bounds
        this.game.world.setBounds(0, 0, 5000, 5000);

        // Simple starry background for now
        this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'bg');

        // Add moon for reference point
        this.moon = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'moon');
        this.moon.anchor.setTo(0.5);
        // this.moon.scale.setTo(0.5);

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

    },

    update: function () {

        // Update health bar
        //updateBar(healthbar, this.ship);
        //updateBar(this.shield, this.ship);

        // --- PLAYER MOVEMENT

        this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship);

        if (this.game.physics.arcade.distanceToPointer(this.ship) > 50) {
            this.game.physics.arcade.moveToPointer(this.ship, SHIP_SPEED);
        } else {
            this.ship.body.velocity.setTo(0);
        }

        // --- FIRE WEAPON

        // Fires with mouse click
        if (this.game.input.activePointer.isDown && this.ship.alive == true) {
            if (this.game.physics.arcade.distanceToPointer(this.ship) > 50) {
                this.game.physics.arcade.moveToPointer(this.ship, 125);
            }
           // weapons[currentWeapon].shoot(this.ship);
        }

        
};


var bulletCollision = function(sprite, weapon) {

    if (weapons[currentWeapon].name == 'OBSIDIAN') {
        this.physics.arcade.collide(weapon, sprite, callDamage, null, this);
    } else {
        this.physics.arcade.overlap(weapon, sprite, callDamage, null, this);
    }

};

var callDamage = function(sprite, weapon) {
    
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
                    this.game.time.events.repeat(Phaser.Timer.SECOND, 2, callDamage, this, sprite, 'lessburn');
                } else if (sunstoneTier == 3) {
                    this.game.time.events.repeat(Phaser.Timer.SECOND, 2, callDamage, this, sprite, 'moreburn');
                }
                sprite.burn = true;
                this.game.time.events.add(Phaser.Timer.SECOND * 3, ointment, this, sprite);
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
                this.game.time.events.add(Phaser.Timer.SECOND * 1.5, defrost, this, sprite);
            }
            if (sapphireTier == 3 && Math.random() < 0.25) {
                sprite.stopped = true;
                this.game.time.events.add(Phaser.Timer.SECOND * 1.5, defrost, this, sprite);
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
        } else if (enemies.children.indexOf(sprite) > -1) {
            sprite.dropLoot();
            enemiesAlive--;
        } else if (sprite.key == 'comet') {
            sprite.dropLoot();
        }
            
        // Scores (+ escape pod)
        if (sprite.key == 'basic') {
            score += 10;
        } else if (sprite.key == 'bruiser') {
            score += 20;
        } else if (sprite.key == 'govt') {
            score += 15;
        } else if (sprite.key == 'captain') {
            score += 30;
            sprite.escapePod();
        } else if (sprite.key == 'escape') {
            score += 50;
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
    
    scoreText.setText( 'SCORE: ' + score + '   DUST: ' + DUST_COLLECTED + '   WEAPON: ' + weapons[currentWeapon].name);
    
};



// --- INITIATE GAME

game.state.add('GameState', GameState);
game.state.start('GameState');
