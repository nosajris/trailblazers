<script lang="ts">
    let { blogs } = $props();
    
    const categories = [
        { title: 'Campus Life', img: '/assets/image17.jpeg' },
        { title: 'Community Service', img: '/assets/slider06.jpeg' },
        { title: 'Worship Nights', img: '/assets/image22.jpeg' },
        { title: 'Leadership Huddles', img: '/assets/slider07.jpeg' }
    ];
</script>

<section id="blog" class="py-24 bg-brand-light">
    <div class="container mx-auto px-6 max-w-7xl">
        <div class="text-center mb-16">
            <h2 class="text-base font-semibold leading-7 text-brand-primary">COMMUNITY IN ACTION</h2>
            <p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">Our Trailblazers & Stories</p>
            <p class="mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600">A glimpse into the life of our vibrant community.</p>
        </div>

        <!-- Visual Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {#each categories as cat}
            <div class="group relative block rounded-lg overflow-hidden aspect-[3/4] cursor-pointer">
                <img src={cat.img} alt={cat.title} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-4 text-white">
                    <h3 class="font-bold">{cat.title}</h3>
                </div>
            </div>
            {/each}
        </div>

        <!-- Blog Cards -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each blogs as blog}
            <a href="/blog" class="card block bg-white rounded-lg shadow-lg overflow-hidden group h-full">
                <img src={blog.imageUrl} alt={blog.title} class="w-full h-48 object-cover">
                <div class="p-6">
                    <p class="text-sm font-semibold text-brand-primary uppercase">{blog.category}</p>
                    <h4 class="font-bold text-lg mt-1 group-hover:text-brand-primary transition-colors">{blog.title}</h4>
                    <p class="text-sm text-gray-600 mt-2">{blog.summary}</p>
                </div>
            </a>
            {/each}
        </div>
    </div>
</section>