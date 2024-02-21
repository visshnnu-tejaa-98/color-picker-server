export const resetPasswordEmail = (name, resetLink) => `<div>
<p>Hi ${name},</p>
<p>Noticed that you requested for password Change, <a href=${resetLink}>Click Here</a> to reset your <strong>UI-Color-Picker</strong> password.</p>
<br />
<br />
<p>Best Regards,</p>
<p>Team UI-Color-Picker</p>
</div>`;
