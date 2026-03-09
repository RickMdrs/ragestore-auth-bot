require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const qs = require('qs');

// ==========================================
// CONFIGURATION & ENVIRONMENT VARIABLES
// ==========================================
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = process.env.DISCORD_CLIENT_ID; 
const OWNER_ID = process.env.KEYAUTH_OWNER_ID;
const KEYAUTH_API_URL = 'https://keyauth.win/api/1.2/';

// Defines the target applications for license validation
const KEYAUTH_APPS = [
    { name: "ragestore", ownerId: OWNER_ID },
    { name: "painelragePRO", ownerId: OWNER_ID }
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define the slash command for the Discord UI
const commands = [
  new SlashCommandBuilder()
    .setName('registerkey')
    .setDescription('Redeem your license key and create an account')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Register commands automatically on startup
(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered successfully.');
  } catch (error) { 
    console.error('❌ Error registering commands:', error); 
  }
})();

client.once('ready', () => console.log(`🤖 Authentication Bot online: ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  // Handle the initial slash command trigger
  if (interaction.isChatInputCommand() && interaction.commandName === 'registerkey') {
    const registrationModal = new ModalBuilder()
        .setCustomId('license_registration')
        .setTitle('Activate License Key');

    registrationModal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('username').setLabel('Username').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('password').setLabel('Password').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('license_key').setLabel('License Key').setStyle(TextInputStyle.Short).setPlaceholder('Paste your key here').setRequired(true))
    );

    await interaction.showModal(registrationModal);
  }

  // Handle the modal submission and KeyAuth API integration
  if (interaction.isModalSubmit() && interaction.customId === 'license_registration') {
    await interaction.deferReply({ ephemeral: true }); // Hides the processing state from other users

    const usernameInput = interaction.fields.getTextInputValue('username');
    const passwordInput = interaction.fields.getTextInputValue('password');
    // Sanitize input to prevent injection
    const sanitizedKey = interaction.fields.getTextInputValue('license_key').replace(/[^a-zA-Z0-9\-]/g, '');

    let isAccountCreated = false;
    let lastErrorMessage = "Unknown error occurred.";

    // Fallback Loop: Iterates through configured apps to validate the provided key
    for (const targetApp of KEYAUTH_APPS) {
        try {
            // Step 1: Initialize Session
            const initPayload = qs.stringify({
                type: 'init',
                name: targetApp.name,
                ownerid: targetApp.ownerId
            });

            const initResponse = await axios.post(KEYAUTH_API_URL, initPayload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (!initResponse.data.success) {
                console.warn(`[${targetApp.name}] Init failed: ${initResponse.data.message}`);
                continue; // Skip to the next app if initialization fails
            }

            const activeSessionId = initResponse.data.sessionid;

            // Step 2: Attempt User Registration
            const registerPayload = qs.stringify({
                type: 'register',
                username: usernameInput,
                pass: passwordInput,
                key: sanitizedKey,
                hwid: "",
                sessionid: activeSessionId,
                name: targetApp.name,
                ownerid: targetApp.ownerId
            });

            const registerResponse = await axios.post(KEYAUTH_API_URL, registerPayload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // If successful, break the loop and notify the user
            if (registerResponse.data.success) {
                isAccountCreated = true;
                await interaction.editReply(`✅ **Success!**\nAccount \`${usernameInput}\` has been successfully provisioned for **${targetApp.name}**.\n\n*Note: Your HWID will be securely bound upon your first login.*`);
                break; 
            } else {
                lastErrorMessage = registerResponse.data.message;
                console.warn(`[${targetApp.name}] Registration rejected: ${registerResponse.data.message}`);
            }

        } catch (apiError) {
            console.error(`Error connecting to KeyAuth API for app ${targetApp.name}:`, apiError);
        }
    }

    // Handle failure across all configured applications
    if (!isAccountCreated) {
        return interaction.editReply(`❌ **Provisioning Failed:** The provided license key is invalid or the username is already taken.\n\n*System Log: ${lastErrorMessage}*`);
    }
  }
});

client.login(TOKEN);