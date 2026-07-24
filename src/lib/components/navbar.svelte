<script lang="ts">
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition';

    let mobileMenuOpen = $state(false);

    function toggleMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function closeMenu() {
        mobileMenuOpen = false;
    }
</script>

<div class="sticky top-0 z-50">
    <!-- Announcement Bar -->
    <div class="bg-brand-gold text-brand-dark font-semibold text-center p-3 text-sm md:text-base">
        <a href="/events" class="hover:underline">
            🔥 Early Bird Registration for National Camp is NOW OPEN! Register today and save! 🔥
        </a>
    </div>

    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-md shadow-sm">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
            <a href="/" class="flex items-center gap-2 font-serif font-bold text-2xl tracking-wider text-brand-dark">
                <img src="/assets/PAOZLOGO.png" alt="PAOZ TRAILBLAZERS Logo" class="h-8">
                <span>Trailblazers</span>
            </a>
            
            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-6 lg:space-x-8 font-semibold text-sm lg:text-base">
                <a href="/events" class="py-2 hover:text-brand-primary nav-link">Events</a>
                <a href="/bep-hub" class="py-2 hover:text-brand-primary nav-link text-brand-primary">BEP Hub</a>
                <a href="/connect" class="py-2 hover:text-brand-primary nav-link">Connect</a>
                <a href="/serve" class="py-2 hover:text-brand-primary nav-link">Serve</a>
                <a href="/about" class="py-2 hover:text-brand-primary nav-link">About</a>
                <a href="/contact" class="py-2 hover:text-brand-primary nav-link">Contact</a>
            </div>
            
            <div class="hidden md:flex items-center gap-4">
                <a href="/login" class="text-sm font-semibold text-gray-500 hover:text-brand-dark">Login</a>
                <a href="/events" class="btn btn-primary !py-2 !px-6 text-sm">Register For Camp</a>
            </div>
            
            <!-- Mobile Button -->
            <button class="md:hidden text-brand-dark" onclick={toggleMenu} aria-label="Open mobile menu">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </nav>

        <!-- Mobile Menu -->
        {#if mobileMenuOpen}
            <div class="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg" transition:slide>
                <div class="px-4 pt-2 pb-6 space-y-1">
                    <a href="/events" onclick={closeMenu} class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-50 border-b border-gray-50">
                        Events
                    </a>
                    <a href="/bep-hub" onclick={closeMenu} class="block px-3 py-3 rounded-md text-base font-medium text-brand-primary bg-orange-50 hover:bg-orange-100 border-b border-gray-50">
                        BEP Hub (Business)
                    </a>
                    {#each ['Connect', 'Serve', 'About'] as item}
                        <a href="/#{item.toLowerCase()}" onclick={closeMenu} class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-50 border-b border-gray-50">
                            {item}
                        </a>
                    {/each}
                    <a href="/contact" onclick={closeMenu} class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-50">
                        Contact
                    </a>
                    <div class="pt-4 flex flex-col gap-3">
                        <a href="/login" onclick={closeMenu} class="text-center py-2 font-bold text-gray-600">Login</a>
                        <a href="/events" onclick={closeMenu} class="btn btn-primary text-center">Register For Camp</a>
                    </div>
                </div>
            </div>
        {/if}
    </header>
</div>