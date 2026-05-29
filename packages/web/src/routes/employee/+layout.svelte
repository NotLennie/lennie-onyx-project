<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  let { children } = $props<{ children: Snippet }>();

  function navStyle(href: string): string {
    const active = page.url.pathname.startsWith(href);
    return active
      ? 'display:block;padding:7px 12px;font-size:10px;letter-spacing:0.08em;color:#C9A84C;text-decoration:none;border-left:2px solid #C9A84C;background:rgba(201,168,76,0.08);'
      : 'display:block;padding:7px 12px;font-size:10px;letter-spacing:0.08em;color:rgba(255,255,255,0.5);text-decoration:none;border-left:2px solid transparent;';
  }
</script>

<div style="min-height:100vh;display:flex;background:#1a1a1a;">
  <aside style="width:190px;flex-shrink:0;display:flex;flex-direction:column;background:#242424;border-right:1px solid #333;">
    <div style="padding:20px 16px;border-bottom:1px solid #333;">
      <div style="font-family:Georgia,serif;color:#C9A84C;font-size:16px;letter-spacing:0.08em;font-weight:400;">ONYX</div>
      <div style="color:rgba(255,255,255,0.35);font-size:7px;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">Staff Portal</div>
    </div>

    <nav style="flex:1;padding:12px 8px;" class="portal-nav">
      <a href="/employee/dashboard" style={navStyle('/employee/dashboard')}>Dashboard</a>
      <a href="/employee/appointments" style={navStyle('/employee/appointments')}>Appointments</a>
      <a href="/employee/pto" style={navStyle('/employee/pto')}>My PTO</a>

      <div style="height:1px;background:#333;margin:8px 12px;"></div>

      <a href="/employee/clients" style={navStyle('/employee/clients')}>Clients</a>
      <a href="/employee/services" style={navStyle('/employee/services')}>Services</a>
      <a href="/employee/employees" style={navStyle('/employee/employees')}>Employees</a>

      <div style="height:1px;background:#333;margin:8px 12px;"></div>

      <a href="/employee/profile" style={navStyle('/employee/profile')}>Profile</a>
      <form method="POST" action="/logout" style="margin:0;">
        <button type="submit" style="display:block;width:100%;text-align:left;padding:7px 12px;font-size:10px;letter-spacing:0.08em;color:rgba(255,255,255,0.5);background:none;border:none;cursor:pointer;border-left:2px solid transparent;">Sign Out</button>
      </form>
    </nav>
  </aside>

  <main style="flex:1;overflow:auto;">
    {@render children()}
  </main>
</div>
